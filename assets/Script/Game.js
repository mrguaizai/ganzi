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
        prefabResult: cc.Prefab,
        txtScore: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.init();
    },

    /**
     * 初始化
     *
     */
    init(){

        this.score = 0;
    },

    /**
     * 显示结算
     *
     * @param {number} score - 得分
     */
    showResult(score){
        let result = this.node.getChildByName("result");
        if(result == null){
            result = cc.instantiate(this.prefabResult);
            this.node.addChild(result, 10, "result");
            result.x = 0;
            result.y = 0;
        }

        result.getComponent("Result").setScore(score);
    },

    /**
     * 隐藏结算
     *
     */
    hideResult(){
        let result = this.node.getChildByName("result");
        if(result != null){
            result.removeFromParent();
        }  
    },

    /**
     * 修改分数
     *
     * @param {*} score
     * @returns
     */
    setScore(score){        
        this.txtScore.string = score;
        this.score = score;
    },

    /**
     * 获取分数
     *
     * @returns
     */
    getScore(){
        cc.log('get', this.score);
        return this.score;
    },

    /**
     * 执行结算逻辑
     *
     * @returns
     */
    settle(){
        this.showResult(this.score);
    },

    // update (dt) {},
});