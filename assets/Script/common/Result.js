// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        txtScore: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 屏蔽触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, event => {
            event.stopPropagation();
            this.node.removeFromParent();
            cc.director.loadScene('game');
        });
       
    },

    /**
     * 设置分数
     *
     * @param {number} score -分数
     */
    setScore(score){
        // score = 9999999;
        if(this.txtScore != null){
            if(score == null || typeof(score) != "number"){
                score = 0;
            }

            this.txtScore.string = score;
        }
    },

    start () {

    },

    // update (dt) {},
});
