Reggae=function(target){
  this.isNodeSpec=function(){return this[0] && J.type(this[0],'str') && this[1] && J.type(this[1],'obj')};
  this.nodeType=this[0];
  this.attrs=this[1];
  this.content=this[2];
  var colTypes={
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
      hprops.name=J.id2name(hprops.id);
      hprops.value=props.value[0];
      props.type="text";
      props.value=props.value[1];
      props.id=props.id.replace(/_id$/,"");
      props.name=J.id2name(props.id);
      return [["input",hprops],["input",props]]
    }
  };
  var actionTypes={
    "get":function(actions){
        J.type(actions,'str') ? 
          this.push(["a",{"class":"instanceAction "+actions},actions.humanize()]) :
          $(actions).map(function(action){
            this.push( ["a",{"class":"instanceAction "+action},action.humanize()]);
          });
    },
    "post":function(){},
    "put":function(){},
    "delete":function(){
      this.push(['input',{"type":"submit", "value":"delete"}])
    }
  };
  var id2name=function (s) {
    parts=s.split('__');
    name=parts.shift();
    $(parts).each(function(part){name+='['+part+']'});
    return name;
  };
  var nodeTypes={
    "link":function(l){
      return ["a",{"href":l.attrs.url},l.attrs.title];
    },
    "msg":function(m){
      return ["p",{"class":"message"},m.content];
    },
    "section":function(m){
      var attrs=m.attrs;
      var nav=$(attrs.navigation).map(function(i){return ["li",{"class":attrs.name+'__nav'},i]});
      return ["div",{"class":"section","id":attrs.name+"__section"},
        [["h1",{},attrs.title],
          ["div",{"class":"menuDescription"},attrs.description],
          ["ul",{"id":attrs.name+"__navigation","class":"navigation"},nav],
          ["div",{"id":attrs.name+"__content","class":"content"}," "] ]
      ];
    },
    "instance":function(i) {
      var ctl;
      var attrs=i.attrs;
      var instance_id=attrs.new_rec ? 'new' : attrs.schema[0][VALUE_INDEX]
      if (attrs.search){
        attrs.new_rec=true;
        var frm=["form",{"action":attrs.url,"method":"get","class":"search","id":attrs.name+'__search__form'}];
      } else {
        var frm=["form",{"action":attrs.url,"method":"post","class":attrs.name+"Instance instance","id":attrs.name+'__'+instance_id+'__form'}];
      }
      var contents=attrs.description ? [["div",{"class":"form_description"}, attrs.description]] : [];
      if(! attrs.new_rec){
        frm[1].action+="/"+attrs.schema[0][VALUE_INDEX]
        contents.push(["input",{"type":"hidden","name":"_method","value":"put"}])
      }
      $(attrs.schema).each(function(col,i){
        var props={"id":attrs.name+"__"+col[1]};
        props.name=id2name(props.id);
        props.value=col[VALUE_INDEX] || "";
        if(col[RESTRICTIONS_INDEX] & RESTRICT_HIDE) {
          if (J.type(props.value,'arr')) {props.value=props.value[0];}  //many_to_one 
          if (col[RESTRICTIONS_INDEX] & RESTRICT_RO) {
            //should there be anything here?? 
          } else {
            props.type="hidden";
            contents.push(["input",props]);
          }
        } else{
          if (col[RESTRICTIONS_INDEX] & RESTRICT_RO) {
            if (J.type(props.value)) {props.value=props.value[1];}  //many_to_one 
            delete props.name;
            var v=props.value;
            delete props.value;
            //ugly as all fucking shit.  Will suffice for now.
            //if(col[0]=="clob"){  v=$.map(v.split("\n"),function(p){return [["p",{},p]]}) }
            //if(col[0]=="clob"){  v=pl('<div>') }
            ctl=["div",props,v];
          } else {
            var c=colTypes[col[0]];
            if (c) {
              ctl=c(props);
            } else {
              props["type"]='text';
              props["class"] || (props["class"]="")
              props["class"]+=col[0];
              ctl=["input",props];
            }
            if (! attrs.new_rec) {
              var show_val;
              if (J.type(ctl[1],'arr')){ //many to one
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
          actionTypes[k].call(actions_dom[2],actions[k])
        }
        contents.push(actions_dom);
      }
      frm.push(contents);
      return ["div",{"class":"instanceContainer"},frm];
    }
  };
  var domFuncs={
    'str': function(){return this.toString();}, //Just plain ridiculous that toString() is necessary
    'obj': function(){return this;},
    'num': function(){return this.toString();},
    'arr': function(){
      if (this.$){return this;}
      if(this.isNodeSpec()) {
        if (node_type=nodeTypes[this.nodeType]) {
          return Reggae.call(node_type(this));
        } else {
          var dom=$('<'+this.nodeType+'>').attr(this.attrs);
          if(this.content){Reggae.call(this.content,dom);}
          return dom;
        }
      } else {
        return $(this).map(function(e){return Reggae.call(e)});
      }
    }
  }
  this.toDom=domFuncs[J.type(this)];
  if (target) {
    var t=target.$ ? target : $(target);
    var d=this.toDom();
    t.empty();
    //the following brought to you by ender silliness (returning array always, adding methods to said array always)
    try {
      t.append(d);
    } catch(err) {
      $(d).each(function(e){
        try {
          t.append(e);
        } catch(err){
          Reggae.call(e,t)
        }
      })
    }
  }
  return this.toDom();
}
