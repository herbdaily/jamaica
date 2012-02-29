r=function(target){
  this.isNodeSpec=function(){return this[0] && pl.type(this[0],'str') && this[1] && pl.type(this[1], 'obj')};
  this.nodeType=this[0];
  this.attrs=this[1];
  this.content=this[2];
  this.toDom=r.domFuncs[pl.type(this)];
  if (target) {
    var t=pl.type(target,'str') ? pl(target) : target;
    var d=this.toDom();
    if (pl.type(d,'arr')){
      t.html('');
      pl.each(d,function(i,e){ t.append(e); });
    } else {
      t.html(d);
    }
  }
  return this;
}
r.colTypes={
  "password":function(props) {
    props.type="password";
    return ["input",props];
  },
  "clob":function(props) {
    var v=props.value;
    delete props.value;
    return ["textarea",props,v];
  },
  "image":function(props){
    props.type="file";
    return["input",props]
  },
  "many_to_one":function(props) {
    var hprops=JSON.parse(JSON.stringify(props));
    hprops.type="hidden";
    hprops.name=j.id2name(hprops.id);
    hprops.value=props.value[0];
    props.type="text";
    props.value=props.value[1];
    props.id=props.id.replace(/_id$/,"");
    props.name=j.id2name(props.id);
    return [["input",hprops],["input",props]]
  }
};
r.actionTypes={
  "get":function(actions){
    pl.type(actions,'str') ? 
      this.push(["a",{"class":"instanceAction "+actions},actions.humanize()]) :
      pl.map(actions,function(action){
        this.push( ["a",{"class":"instanceAction "+action},action.humanize()]);
      });
  },
  "post":function(){},
  "put":function(){},
  "delete":function(){
    this.push(['input',{"type":"button", "value":"delete"}])
  }
};
r.id2name=function (s) {
  parts=s.split('__');
  name=parts.shift();
  pl.each(parts,function(i,part){name+='['+part+']'});
  return name;
};
r.nodeTypes={
  "link":function(l){
    return ["a",{"href":l.attrs.url},l.attrs.title];
  },
  "msg":function(m){
    return ["div",{"class":"message"},[["h2",{},m[1].title],["p",{},m[1].description]]];
  },
  "section":function(m){
    if (r.sectionTypes[m.attrs.name]){ return r.sectionTypes[m.attrs.name]};
    var attrs=m.attrs;
    var nav=pl.map(attrs.navigation,function(i){return ["li",{},[i]]});
    return ["div",{"class":"section","id":attrs.name+"__section"},
      [ ["h1",{},attrs.title],
      ["div",{"class":"menuDescription"},attrs.description],
      ["ul",{"class":"navigation"},nav],
      ["div",{"class":attrs.name+"__content content"},m.content]]
    ];
  },
  "instance":function(i) {
    if (r.instanceTypes[i.attrs.name]){ return r.instanceTypes[i.attrs.name]};
    var ctl;
    var attrs=i.attrs;
    var instance_id=attrs.new_rec ? 'new' : attrs.url.replace(/.*\//,'')
    if (attrs.search){
      attrs.new_rec=true;
      var frm=["form",{"action":attrs.url,"method":"get","class":"search","id":attrs.name+'__search__form'}];
    } else {
      var frm=["form",{"action":attrs.url,"method":"post","class":attrs.name+"Instance instance","id":attrs.name+'__'+instance_id+'__form'}];
    }
    var contents=attrs.description ? [["div",{"class":"form_description"}, attrs.description]] : [];
    if(! attrs.new_rec){
      contents.push(["input",{"type":"hidden","name":"_method","value":"put"}])
    }
    pl.each(attrs.schema, function(i,col){
      var props={"id":attrs.name+"__"+col[1]};
      props.name=r.id2name(props.id);
      props.value=col[VALUE_INDEX] || "";
      if(col[RESTRICTIONS_INDEX] & RESTRICT_HIDE) {
        if (props.value.constructor==Array) {props.value=props.value[0];}  //many_to_one 
        if (col[RESTRICTIONS_INDEX] & RESTRICT_RO) {
          //should there be anything here?? 
        } else {
          props.type="hidden";
          contents.push(["input",props]);
        }
      } else{
        if (col[RESTRICTIONS_INDEX] & RESTRICT_RO) {
          if (props.value.constructor==Array) {props.value=props.value[1];}  //many_to_one 
          delete props.name;
          var v=props.value;
          delete props.value;
          //ugly as all fucking shit.  Will suffice for now.
          //if(col[0]=="clob"){  v=$.map(v.split("\n"),function(p){return [["p",{},p]]}) }
          //if(col[0]=="clob"){  v=pl('<div>') }
          ctl=["div",props,v];
        } else {
          if (c=r.colTypes[col[0]]) {
            ctl=c(props);
          } else {
            props["type"]='text';
            props["class"] || (props["class"]="")
            props["class"]+=col[0];
            ctl=["input",props];
          }
          if (! attrs.new_rec) {
            var show_val;
            if (ctl[1].constructor==Array){ //many to one
              show_val=ctl[1][1].value
            } else if (col[0]=="image") {
              show_val=["img",{"src":ctl[1].value}]
            //} else if(col[0]=="clob"){  //ugly as all fucking shit.  Will suffice for now.
              //show_val=$.map(col[VALUE_INDEX].split("\n"),function(p){return [["p",{},p]]})
              //show_val=pl('<div>').html(col[VALUE_INDEX]);
            } else {
              show_val=ctl[1].value || ctl[2] //textarea value
            }
            ctl=["div",{"class":"editable col"},[ctl,["span",{},show_val]]] 
          }
        }
        contents.push(["div",{"class":props.id+"ColContainer colContainer"},[["label",{"for":props.id},col[1].humanize()+":"],ctl]]);
      }
    });
    if (attrs.search){
      contents.push(["input",{"type":"submit","value":"Search"}]);
    } else {
      contents.push(["input",{"type":"submit","value":"Save","class":"submit " + (attrs.new_rec ? "" : "hidden")}]);
    }
    if ((! attrs.new_rec) && (actions=attrs.actions)){
      actions_dom=["div",{"class":"instanceActions"},[]];
      for (var k in actions) {
        r.actionTypes[k].call(actions_dom[2],actions[k])
      }
      contents.push(actions_dom);
    }
    frm.push(contents);
    var content=i.content || [];
    content.unshift(frm);
    return ["div",{"class":"instanceContainer"},content];
  }
  };
r.instanceTypes={}
r.sectionTypes={}
r.domFuncs={
  'str' : function(){ return document.createTextNode(this);},
  'int' : function(){ return document.createTextNode(this);},
  'obj' : function(){return this;},
  'arr' : function(){
    if(this.isNodeSpec()) {
      if (node_type=r.nodeTypes[this.nodeType]) {
        return r.call(node_type(this)).toDom();
      } else {
        var dom=pl('<'+ this.nodeType+'>',this.attrs);
        if(this.content){ r.call(this.content, dom);}
        return dom.get();
      }
    } else {
      return pl.map(this, function(e){return r.call(e).toDom()})
    }
  }
};
r.toDom=function(){
  r.domFuncs[pl.type(this)].call(this);
};