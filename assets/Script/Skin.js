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
        spriteFrameZhuzi: [cc.SpriteFrame],

        index: {
            default: -1,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        let jsLadder = this.getComponent("Ladder");
        if(jsLadder != null){
            jsLadder.changeLadderPosition();
        }
    },


    /**
     * 获取[min, max]的随机数整数
     *
     * @param {number} min - 最小整数
     * @param {number} max - 最大整数
     * @returns
     */
    randomNum(min, max){
        return Math.floor(Math.random()*(max-min+1)+min);
    },


    /**
     *  获取柱子纹理
     *
     * @returns
     */
    getZhuziSpriteFrame(){
        if(this.spriteFrameZhuzi.length <= 0){
            return null;
        }

        if(this.index < 0 || this.index >= this.spriteFrameZhuzi.length){
            this.index = this.randomNum(0, 2);
        }

        return this.spriteFrameZhuzi[this.index];
    },
    // update (dt) {},
});
