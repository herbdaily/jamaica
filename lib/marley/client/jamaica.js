RESTRICT_HIDE=1;
RESTRICT_RO=2;
RESTRICT_REQ=4;
NAME_INDEX=1;
TYPE_INDEX=PROPS_INDEX=2;
RESTRICTIONS_INDEX=2;
VALUE_INDEX=3;
String.prototype.humanize=function(){return pl.map(this.replace(/^_/,'').split('_'),function(w){return w[0].toUpperCase()+w.slice(1)}).join(' ');}
pl(function(){
  r.call(_jamaica_json,'body');
  pl('.content:empty').remove();
  var contents=pl('.content');
  if (contents.get().length===0){
    pl('#main_menu__section').append('<div id="current_content" class="content active"></div>');
  }else{
    contents.appendTo('#main_menu__section');
  }
  pl.win_bind('form','submit',j.formSubmit);
  pl.win_bind('.navigation li a','click',j.menuClick);
  pl.win_bind('.navigation li h1','click',j.toggleNav);
  pl.win_bind('.editable','click',j.toggleColStat);
  pl.win_bind('.editing input,.editing textarea','keydown',j.colEditKeydown);
  pl.win_bind('.instanceAction','click',j.instanceActionClick);
  pl.win_bind('input[value=delete]','click',j.deleteInstance);
});

j={
  ajax_defaults:{
    load:function(){pl('body').css('cursor','wait')},
    always:function(){pl('body').css('cursor','default');},
    success:function(json){r.call(json,'#'+this.id); },
    error:function(stat,json){
      var err=JSON.parse(json);
      var attrs=err[1];
      var frm_id=this.id;
      if (attrs.error_type=='validation') {
        for (col in attrs.error_details) {
          pl('#'+frm_id+' [id$=__'+col+']').addClass('errorCol').after(r.call(["p",{"class":"errorMsg"},attrs.error_details[col]]).toDom());
        }
      }
    },
  },
  make_ajax_params:function(params){
    return pl.extend(params,
      pl.extend(pl.get_callbacks.call(this,j.ajax_defaults),{
        dataType:'json',
        url:this.href || this.action,
        type: this.method ? this.method.toUpperCase() : 'GET'
      })
    );
  },
  menuClick:function(e){
    e.preventDefault();
    //var target='#'+pl(this).parents('.navigation').attr('id').replace(/__navigation$/,'__content');
    var target='#current_content';
    pl.ajax(j.make_ajax_params.call(this,{success:function(json){r.call(json,target)}}));
  },
  formSubmit:function(e){
    e.preventDefault();
    pl.ajax(j.make_ajax_params.call(this,{data:pl.serialize(this.id)}))
  },
  toggleNav:function(e){
    pl(pl(this).parents('li').elements[0]).toggleClass('collapsed');
  },
  toggleColStat:function(e){
    p=this.selector ? this : pl(this);
    p.toggleClass("editing").toggleClass("editable");
    if(p.hasClass("editing")){
      if (p.children('input[type=submit]').get().length==0) p.append(pl('<input>',{type:'submit',value:'save'}).get());
      p.children().get()[0].focus();
    } else {
      p.children('input[type=text],textarea').val(p.children('span').html())
    }
  },
  colEditKeydown:function(e){
    if (e.keyCode==27){
      j.toggleColStat.call(pl(this).parents('.editing'));
    }
  },
  instanceActionClick:function(e){
    var frm=pl(this).parents('form');
    var url=frm.attr('action')+'/'+pl(this).attr('class').replace(/.* /,'');
    pl.ajax(j.make_ajax_params.call({href:url},{success:function(json){frm.after(r.call(json).toDom())}}))
  },
  deleteInstance:function(e){
    var frm=pl(this).parents('form');
    pl.ajax({url:frm.attr('action'),type:'POST',data:{_method:'delete'},success:function(){frm.remove()}})
  },
}
