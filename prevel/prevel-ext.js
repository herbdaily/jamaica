pl.extend({
  get_callbacks: function(fn){
    var that=this;
    var cb={};
    if (pl.type(fn,'fn')) {
      cb=function() {
        fn.apply(that,arguments);
      }
    } else {
      for (i in fn) {
        cb[i]=pl.get_callbacks.call(that,fn[i]);
      }
    }
    return cb;
  },
  win_bind:function(selector,evt,fn){
    window.addEventListener(evt, function(e){
      elems=pl(selector).get()
      if (elems==e.target || pl.filter(elems, function(el){return el==e.target}).length > 0){
        fn.call(e.target,e);
      }
    });
  },
  selectedBy: function(elem,selector) {
    elems=pl(selector).get()
    return (elems===elem || pl.filter(elems, function(el){return el==elem}).length > 0)
  },
  parents: function(elem, selector) {
    var ret=[]; var p;
    if (pl.type(elem,'str')) elem=pl(elem).get();
    if (p=elem.parentNode){
      if( !selector||pl.selectedBy(p,selector)) ret.push(p);
      return ret.concat(pl.parents(p,selector));
    }
  },
});
pl.extend(pl.fn,{
  selectedBy: function(selector) {
    return pl.selectedBy(this.get(),selector);
  },
  parents: function(selector) {
    return pl.parents(this.elements[0], selector);
  },
  children: function() {
    this.elements = [this.elements[0].childNodes];
    return this;
  },
        
},true);
