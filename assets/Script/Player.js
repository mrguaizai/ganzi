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
        player:{
            default:null,
            type:cc.Sprite
        },

        runSpeed:{
            default: 0.002,
            displayName: "前进速度",
            tooltip:"值越大越慢"
        },

        fallSpeed:{
            default: 0.5,
            displayName: "下落速度",
            tooltip:"值越大越慢"
        },

        offset:{
            default: 5,
            displayName:"偏移量",
            tooltip:"人物右侧距离所在地块右侧偏移量"
        },

        spriteFrameBingo1: cc.SpriteFrame,
        spriteFrameBingo2: cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    /**
     * 人物跑动
     *
     * @param {object} param {length: number, onRunEnd:function}
     *      length:水平移动距离，正数右移，负数左移
     *      onRunEnd:移动结束回调
     * @returns
     */
    run(param){
        if(this.player == null){
            return;
        }

        if(param.length == null || typeof(param.length) != "number"){
            return;
        }

        let animation = this.getComponent(cc.Animation);

        let move = cc.moveBy(this.runSpeed * param.length, param.length, 0);
        let swpan = cc.spawn(move, cc.callFunc(function(){
            animation.stop("Run");
            animation.playAdditive("Run");
        }));

        // 移动结束回调
        let onRunEnd = cc.callFunc(function(){
            animation.stop();
            if(param.onRunEnd != null && typeof(param.onRunEnd) == "function"){
                param.onRunEnd();
            }
        });

        // 执行动画
        let sequence = cc.sequence(swpan, onRunEnd);
        this.player.node.runAction(sequence);
    },

    /**
     * 人物死亡，从高处掉落
     *
     * @param {object} param {onFailEnd: function, onDieEnd:function}
     *      onFailEnd：掉落结束回调
     *      onDieEnd：死亡回调
     * @returns
     */
    die(param){
        if(this.player == null){
            return;
        }

        // 计算掉落距离
        let word_pos = this.player.node.convertToWorldSpace(this.player.node.position);
        let length = word_pos.y + this.player.node.height;
        let move = cc.moveBy(this.fallSpeed * length, 0, -length);

        // 掉落回调
        let onMoveEnd = cc.callFunc(function(){
            if(param != null && param.onFailEnd != null && typeof(param.onFailEnd) == "function"){
                param.onFailEnd();
            }
        });

        // 死亡回调
        let onDieEnd = cc.callFunc(function(){
            if(param != null && param.onDieEnd != null && typeof(param.onDieEnd) == "function"){
                param.onDieEnd();
            }
        });

        // 执行动画
        let sequece = cc.sequence(move, onMoveEnd, /*cc.removeSelf(),*/ onDieEnd);
        this.player.node.runAction(sequece);
    },

    /**
     * 移动位置，人物每次更换父节点，需要调整到最新的右边位置
     *
     */
    moveToRight(){
        let parent = this.node.getParent();
        this.node.x = parent.width * (1 - parent.anchorX) - (1 - this.node.anchorX) * this.node.width - this.offset;
        this.node.y = parent.height * (1 - parent.anchorY) + this.node.anchorY * this.node.height;
    },

    /**
     * 播放双倍积分奖励动画
     *
     * @param {number} type 1-1分 2-2分
     * @returns
     */
    playBingo(type){
        if(this.spriteFrameBingo1 == null || this.spriteFrameBingo2 == null){
            return;
        }

        let node = new cc.Node("bingo");
        let sprite = node.addComponent(cc.Sprite);
        if(type == 1){
            sprite.spriteFrame = this.spriteFrameBingo1;
        }
        else{
            sprite.spriteFrame = this.spriteFrameBingo2;
        }

        node.anchorX = 0.5;
        node.anchorY = 0.5;
        node.x = 0;
        node.y = 0;

        this.node.addChild(node);
        
        let move = cc.moveBy(0.5, 0, 100);
        node.runAction(cc.sequence(move, cc.removeSelf()));
    },

    // update (dt) {},
});
