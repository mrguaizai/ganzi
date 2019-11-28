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
        maxLength:{
            default:200,
            displayName:"最大高度",
            tooltip:"梯子能到的最大高度"
        },

        minLength:{
            default:10,
            displayName:"最低高度",
            tooltip:"梯子能到的最低高度"
        },

        ladderWidth:{
            default:6,
            displayName:"梯子宽度",
        },

        ladderSpriteFrame:{
            default:null,
            type:cc.SpriteFrame,
            tooltip:"绘制梯子用"
        },

        putSpeed:{
            default:0.5,
            displayName: "放梯子速度",
            tooltip:"值越大越慢"
        },

        player:{
            default:null,
            type:cc.Node,
            displayName:"人物",
        },

        standNode:{
            default:null,
            type:cc.Node,
            tooltip:"人物所在地"
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.player.setParent(this.standNode);
        this.player.getComponent("Player").moveToRight();

        this.putLadder();
    },

    putLadder(){
        let land = this.standNode;

        // 有梯子，不再增加
        if(land.getChildByName("ladder") != null){
            return;
        }
        console.log(123);
        let node = new cc.Node("ladder");
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.ladderSpriteFrame;
        sprite.type = cc.Sprite.Type.FILLED;
        sprite.fillType = cc.Sprite.FillType.VERTICAL;
        node.anchorX = 0;
        node.anchorY = 0;
        node.width = this.ladderWidth;
        node.height = this.maxLength;

        // 1-新摆放的 2-在伸长的 3-伸长结束的
        node.status = 1;
        node.x = land.width * (1 - land.anchorX);// - node.width * (1 - node.anchorX);
        node.y = land.height * (1 - land.anchorY) - node.height * node.anchorY;
        
        land.addChild(node);
    },

    changeLadderPosition(){
        if(this.standNode == null){
            return;
        }

        let land = this.standNode;
        let node = this.standNode.getChildByName("ladder");
        node.x = land.width * (1 - land.anchorX) - node.width * (1 - node.anchorX);
        node.y = land.height * (1 - land.anchorY) - node.height * node.anchorY;
    },

    start () {
        // 开始伸梯子
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){
            self.startPutLadder();
        });

        // 结束伸梯子
        this.node.on(cc.Node.EventType.TOUCH_END, function(event){
            self.stopPutLadder();
        });
    },

    startPutLadder(){
        let ladder = this.standNode.getChildByName("ladder");
        if(ladder == null){
            return;
        }

        if(ladder.status != 1){
            return;
        }

        let ladderSprite = ladder.getComponent(cc.Sprite);
        if(ladderSprite == null){
            return;
        }

        ladder.status = 2;
        let action = cc.spawn(cc.delayTime(0.02), cc.callFunc(function(){
            let fillRange = ladderSprite.fillRange;
            fillRange += 0.05;
            if(fillRange <= 1){
                ladderSprite.fillRange = fillRange;
            }
            else{
                ladderSprite.fillRange = 1;
                ladder.stopAllActions();
            }
        }));

        ladderSprite.fillRange = this.minLength / this.maxLength;
        ladder.runAction(action).repeatForever();
    },

    stopPutLadder(){
        let ladder = this.standNode.getChildByName("ladder");
        if(ladder == null){
            return;
        }

        if(ladder.status != 2){
            return;
        }

        let ladderSprite = ladder.getComponent(cc.Sprite);
        if(ladderSprite == null){
            return;
        }

        ladder.stopAllActions();

        ladder.status = 3;
        let self = this;
        let sequence = cc.sequence(cc.rotateBy(this.putSpeed, 90), cc.callFunc(function(){
            do{
                if(self.player == null){
                    break;
                }

                let js = self.player.getComponent("Player");
                if(js == null){
                    break;
                }

                js.run({
                    length: self.getRunLength(),
                    onRunEnd: function(){
                        self.check();
                    }
                });

            }while(0);
        }));
        ladder.runAction(sequence);
    },

    update (dt) {

    },

    getRunLength(){
        let ladder = this.standNode.getChildByName("ladder");
        let factory = this.node.getComponent("LandFactory");

        if(ladder == null || factory == null){
            return;
        }

        let last = factory.lastLand;
        let next = factory.nextLand;

        if(last == null || next == null){
            return;
        }

        let last_x_r = last.x + last.width * (1 - last.anchorX);
        let next_x_l = next.x - next.width * next.anchorX;
        let next_x_r = next.x + next.width * (1 - next.anchorX);

        let min = next_x_l - last_x_r;
        let max = next_x_r - last_x_r;

        let length = ladder.height * ladder.getComponent(cc.Sprite).fillRange;

        if(length > min && length < max){
            return max;
        }
        else{
            return length;
        }
    },

    check(){
        let factory = this.node.getComponent("LandFactory");
        if(factory == null){
            return;
        }

        let last = factory.lastLand;
        let next = factory.nextLand;

        let last_x_r = last.x + last.width * (1 - last.anchorX);
        let next_x_l = next.x - next.width * next.anchorX;
        let next_x_r = next.x + next.width * (1 - next.anchorX);

        let min = next_x_l - last_x_r;
        let max = next_x_r - last_x_r;

        if(min < 0 || max < 0 || min >= max){
            return;
        }

        let ladder = this.standNode.getChildByName("ladder");
        let length = ladder.height * ladder.getComponent(cc.Sprite).fillRange;

        // 成功（人物放到最新节点上，并修改位置，然后生成下一块）
        if(length > min && length < max){
            // 算分
            this.calcScore();

            // 修改所在区域
            this.player.setParent(factory.nextLand);
            this.standNode = factory.nextLand;

            // 铺梯子
            this.putLadder();
            this.player.getComponent("Player").moveToRight();

            // 生成下一块
            factory.next();
        }
        // 失败
        else{
            let self = this;
            let callback = cc.callFunc(function(){
                let js = self.player.getComponent("Player");
                if(js != null){
                    js.die({
                        // 掉下来了
                        onFailEnd: function(){

                        },
                        // 结束了
                        onDieEnd: function(){
                            self.onDeadCallback();
                        }
                    });
                }
                else{
                    cc.log("js is null.");
                }
            });
            ladder.runAction(cc.sequence(cc.rotateBy(0.2, 90), callback));
        }
    },

    calcScore(){
        let factory = this.node.getComponent("LandFactory");
        let last = factory.lastLand;
        let next = factory.nextLand;
        let offset = next.x - last.x - (1 - last.anchorX) * last.width;
        
        let rewardWidth = factory.rewardWidth;

        let min = offset - Math.floor(rewardWidth / 2);
        let max = offset + Math.floor(rewardWidth / 2);

        let ladder = this.standNode.getChildByName("ladder");
        let ladderLength = ladder.height * ladder.getComponent(cc.Sprite).fillRange;

        
        let score = 1;
        if(ladderLength > min && ladderLength < max){
            score = 2;
        }

        let game = this.getComponent("Game");
        game.setScore(game.getScore() + score);

        let playerJS = this.player.getComponent("Player");
        playerJS.playBingo(score);
    },
    
    onDeadCallback(){
        let game = this.getComponent("Game");
        if(game != null){
            game.settle();
        }
    },
});
