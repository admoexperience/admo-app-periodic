'use strict';

AdmoApp.MainCtrl = function($scope) {

    var button1 = FlipButton.create({
      extraCss:["button1"],
      fixed: true,
      duration: 0,
      flipAxis: 'rotateY',

      proceed:function(){
        periodicTable.transform( periodicTable.targets.table, 1000 );
      }
    });

    var button2 = FlipButton.create({
      extraCss:["button2"],
      fixed: true,
      duration: 0,
      flipAxis: 'rotateY',

      proceed:function(){
        periodicTable.transform( periodicTable.targets.sphere, 1000 );
      }
    });

    var button3 = FlipButton.create({
      extraCss:["button3"],
      fixed: true,
      duration: 0,
      flipAxis: 'rotateY',

      proceed:function(){
        periodicTable.transform( periodicTable.targets.helix, 1000 );
      }
    });

    var button4 = FlipButton.create({
      extraCss:["button4"],
      fixed: true,
      duration: 0,
      flipAxis: 'rotateY',

      proceed:function(){
        periodicTable.transform( periodicTable.targets.grid, 1000 );
      }
    });

    var handRight = HighlightSource.create({
      source:User.hands.right,
    });

    var periodicTable = PeriodicTable.create({
      source:User.head,
    });

    AdmoApp.Screens.startScreen = Screen.create({
      components:[periodicTable, handRight, button1, button2, button3, button4],

    });

    /**********STATE SCREEN HANDLER***************/

    AdmoApp.stateChanged = function(oldState, newState) {
      if( oldState == 3 && (newState==2 || newState==1)){
        AdmoApp.setScreen(AdmoApp.Screens.startScreen);
      }

      if (oldState == 3 && newState != 3){
        //User has gone out of view stop the users session
         Stats.endSession();
      }
    };

    /**********STATE SCREEN HANDLER***************/


    AdmoApp.init();

    //Init the AdmoApp
    AdmoApp.angularScope = $scope;

    //Set the default screen for the app (ie the starting screen.)
    AdmoApp.setScreen(AdmoApp.Screens.guidanceScreen);

};

