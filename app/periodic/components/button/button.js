//*****************************************************************
// A button that can be pressed by hovering a hand over it.
//
// The bulk of the code is to draw an arc around the (circular)
// button, which grows while hovered and shrinks again when the
// hand is removed.
//
// The `proceed` function is called when it is hovered for long enough.
//*****************************************************************

Button = Tracker.create({
  content: "",
  threshold: "",
  duration: 2000,
  interval: null,
  triggers: [User.hands.right, User.hands.left],
  css: ["button", "component", "follow"],
  currentPosition: {x:0,y:0},
  buttonRadius: 0,
  initTriggerCoordinates: [{x:1, y:1},{x:1, y:1}],
  outOfInitRange:[true,true],
  positionCenter: 'center',
  // Called from tracker.js - just update the position
  updateElement: function() {
    var self = this;

    //update the current position of the button
    if(this.positionCenter == 'center'){
      self.currentPosition.x = self.element.offset().left + (self.element.outerWidth() + self.border)/2;
      self.currentPosition.y = self.element.offset().top + (self.element.outerHeight() + self.border)/2;
    }
    else if(this.positionCenter == 'left'){
      self.currentPosition.x = self.element.offset().left + (self.element.outerHeight() + self.border)/2;
      self.currentPosition.y = self.element.offset().top + (self.element.outerHeight() + self.border)/2;
    }
    else if(this.positionCenter == 'right'){
      self.currentPosition.x = self.element.offset().left + (self.element.outerWidth() + self.border) - (self.element.outerHeight() + self.border)/2;
      self.currentPosition.y = self.element.offset().top + (self.element.outerHeight() + self.border)/2;
    }


    self.buttonRadius = 0;//(self.element.outerWidth() + self.border)/2

    //Because you have multiple sources, the one source will hover and the other will unhover.
    //So you need to check all of them and then hover them.
    var myHover = false;
    for(var i in this.triggers){
      var trigger = this.triggers[i];

      var triggerX = trigger.x*this.scale + this.scaleOffset.x;
      var triggerY = trigger.y*this.scale + this.scaleOffset.y;

      var y = this.checkInitialHover(i,triggerX,triggerY);
      var x = this.checkHover(triggerX,triggerY);

      //if the hand is 25px from bottom do not hover
      var handToLow = true;
      var deltaBelowY = 25;
      if(triggerY > (AdmoConfig.screenHeight-deltaBelowY))
        handToLow = false;

      if (x && y && handToLow){
        myHover = true;
      }
    }
    if(myHover){
      this.hover();
    }else{
      this.unhover();
    }

  },

  shown: function() {

    this.element.fadeIn();
    this.proceeding = false;
    this.interval = null;
  },

  hidden: function() {
    this.element.fadeOut();
  },

  html: function(){

    return '<div class="content">'+this.content+'</div>' +
    '<div class="icon"></div>' +
    '<div class="mask">'+
      '<div class="animation"></div>'+
    '</div>';
  },

  //check if an specific hand can be activated to trigger a hover event
  checkInitialHover: function(i, x, y){
    var hoverReady = false;

    var initRadius = 100*this.scale;
    var initX = this.initTriggerCoordinates[i].x*this.scale + this.scaleOffset.x;
    var initY = this.initTriggerCoordinates[i].y*this.scale + this.scaleOffset.y;

    var deltaX = Math.abs(initX - x);
    var deltaY = Math.abs(initY - y);

    if((deltaX<initRadius)&&(deltaY<initRadius)&&(this.outOfInitRange[i])){
      return false;
    }
    else{
      this.outOfInitRange[i] = false;
      return true;
    }
  },

  // Check whether one or both of the user's hands is over the button
  checkHover: function(x, y) {
    this.threshold = (this.width/2 + 10) * (this.width/2 + 1);
    var center = {};

    center.x = this.x + (this.width + this.border)/2;
    center.y = this.y + (this.height + this.border)/2;
    // Hover detection
    var hovering = false;
    var dX = center.x - x;
    var dY = center.y - y;
    // Check the button itself
    var d2 = dX * dX + dY * dY; // Use the square of the distance
    if (d2 < this.threshold)
      hovering = true;

    return hovering;
  },

  hover: function() {

    if (!this.hovering) {
      this.hovering = true;
      if (!this.interval) {
        $('.animation',this.element).addClass('animationactive');
        //work out the second value from the delay to set the "animation" effect to be in sync
        var seconds = (this.duration/1000);
        $('.animation',this.element).css('transition', seconds+'s ease');
        this.interval = window.setTimeout(this.fillButton, this.duration);
      }
    }
  },
  unhover: function() {
    if (this.hovering) {
      this.hovering = false;
      $('.animation',this.element).removeClass('animationactive');
      window.clearTimeout(this.interval);
      this.interval=null;
    }
  },

  fillButton: function() {
    this.interval=null;
    this._triggerProceed();
    this.proceeding = false;
  },

  init: function() {
    this._setId();
    this._reset();
    this.currentPosition = {x:0, y:0};

    this.threshold = (this.width/2 + 10) * (this.width/2 + 1);13

    //get initial values of hands
    for(var i in this.triggers){
      this.initTriggerCoordinates[i].x = this.triggers[i].x;
      this.initTriggerCoordinates[i].y = this.triggers[i].y;
    }

    this.outOfInitRange = [true,true];
    var self = this;
    this.addTimeout('timeoutName',function(){
      self.outOfInitRange = [false,false];
    },5000);
  },
});
