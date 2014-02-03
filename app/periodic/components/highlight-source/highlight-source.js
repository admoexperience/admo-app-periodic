
//*****************************************************************
// A pulsing circle that can be used to highlight different sources: hands/head
//*****************************************************************

HighlightSource = Tracker.create({
  source: User.head,
  //'highlight-pulse'
  name: 'highlight-source',
  active:true,
  turnOn:false,

  updateElement: function(){

    if((this.turnOn) && (!this.active)){
      this.element.transition({opacity:0.8},250);
      this.turnOn = false;
    }

  },

  shown: function(){
    var self = this;
    if(this.active){
      this.element.css({opacity:0.8});
      this.addTimeout('highlightHide',function(){
        self.element.transition({opacity:0},1000);
      },5000);
    }
    else{
      this.element.css({opacity:0});
    }
  },

});
