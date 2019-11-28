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
        totalHeight: {
            default: 250,
            displayName: "总高度",
            tooltip: "占屏幕高度百分比%",
        },

        topHeight: {
            default: 50,
            displayName: "上层高度",
            tooltip: "占总高度百分比%"
        },

        rewardWidth: {
            default: 10,
            displayName: "奖励区域大小",
            tooltip: "红色部分"
        },

        minDistance: {
            default: 10,
            displayName: "最小间距",
            tooltip: "水平线两块之间最小间距"
        },

        maxDistance: {
            default: 200,
            displayName: "最大间距",
            tooltip: "水平线两块之间最大间距"
        },

        minWidth: {
            default: 10,
            displayName: "最小宽度",
            tooltip: "单块最小宽度"
        },

        maxWidth: {
            default: 100,
            displayName: "最大宽度",
            tooltip: "单块最大宽度"
        },

        startOffset: {
            default: 100,
            displayName: "起始距离",
            tooltip: "人物起始位置"
        },

        spGrass: {
            default: null,
            type: cc.Sprite,
            tooltip: "草地"
        },

        bgOffset: {
            default: 640,
            displayName: "移动偏移量",
            tooltip: "错位移动效果"
        },

        // 父节点位置
        parentNode: {
            default: null,
            type: cc.Node
        },

        // 靶心纹理
        spriteFrameDouble: {
            default: null,
            type: cc.SpriteFrame
        },

        // // 上一层纹理
        // spriteFrameTop:{
        //     default:null,
        //     type:cc.SpriteFrame
        // },

        // // 下一层纹理
        // spriteFrameBottom:{
        //     default:null,
        //     type:cc.SpriteFrame
        // },

        // 起始位置
        startNode: {
            default: null,
            type: cc.Node,
        },

        // 前一块
        lastWidth: {
            default: 0,
            visible: false,
        },

        lastLand: {
            default: null,
            type: cc.Node,
            visible: false,
        },

        // 下一块
        nextWidth: {
            default: 0,
            visible: false,
        },

        nextLand: {
            default: null,
            type: cc.Node,
            visible: false,
        },

        // 废弃块
        oldLand: {
            default: null,
            type: cc.Node,
            visible: false,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 调整起跳陆地位置
        this.initStartNode();

        this.lastLand = this.startNode;
        this.lastWidth = this.startNode.width;
        this.nextWidth = this.startNode.width;
        this.lastLand.zIndex += 1;

        let land = this.boreLand();
        if (land != null) {
            let x = this.startOffset + this.generateDistance(this.lastWidth, land.width, this.maxDistance, this.minDistance);
            if (x != null) {
                land.x = x;
            }
            this.nextLand = land;
        }
    },

    /**
     * 初始化起跳陆地
     *
     */
    initStartNode() {
        // 重新定位置
        let y = 0;
        if (this.totalHeight <= 0) {
            y = 0;
        } else if (this.totalHeight >= 100) {
            y = cc.winSize.height;
        } else {
            y = Math.floor(cc.winSize.height * this.totalHeight / 100);
        }

        this.startNode.x = this.startNode.anchorX * this.startNode.width;
        this.startNode.y = y - (1 - this.startNode.anchorY) * this.startNode.height;
    },


    /**
     * 移动
     *
     * @returns
     */
    next() {
        if (this.lastLand != null && this.lastLand.getNumberOfRunningActions() > 0) {
            return;
        }

        if (this.nextLand != null && this.nextLand.getNumberOfRunningActions() > 0) {
            return;
        }

        let landLeft = this.lastLand;
        let landMid = this.nextLand;
        let landRight = this.boreLand();

        let l_x = -(landLeft.width / 2 + cc.winSize.width);
        let m_x = this.startOffset - Math.floor(landMid.width / 2);
        let r_x = m_x + this.generateDistance(this.lastWidth, this.nextWidth, this.maxDistance, this.minDistance);

        let interval = 0.001;
        let l_t = (landLeft.x - l_x) * interval;
        let m_t = (landMid.x - m_x) * interval;
        let r_t = (landRight.x - r_x) * interval;

        // 左侧块移动
        landLeft.runAction(cc.sequence(cc.moveTo(l_t, l_x, landLeft.y), cc.removeSelf()));

        // 通知梯子，人物所在地块发生变化
        let lastIsMoving = true;
        let nextIsMoving = true;

        let self = this;
        let callback = function () {
            // 两个都停下运动
            if (!lastIsMoving && !nextIsMoving) {
                let ladder = self.getComponent("Ladder");
                if (ladder != null) {
                    ladder.standNode = landMid;
                }
            }
        }

        // 中间块移动
        landMid.runAction(cc.sequence(cc.moveTo(m_t, m_x, landMid.y), cc.callFunc(function () {
            lastIsMoving = false;
            callback();
        })));

        // 新生成块移动
        landRight.runAction(cc.sequence(cc.moveTo(r_t, r_x, landRight.y), cc.callFunc(function () {
            nextIsMoving = false;
            callback();
        })));

        this.oldLand = landLeft;
        this.lastLand = landMid;
        this.nextLand = landRight;

        this.lastLand.zIndex += 1;
    },


    /**
     * 摆放新陆地
     *
     * @returns
     */
    boreLand() {
        if (this.parentNode != null) {
            let land = this.generateLand();
            this.parentNode.addChild(land);
            land.x = cc.winSize.width + land.width / 2;
            return land;
        }
        return null;
    },

    /**
     * 获取一块新的陆地，先生成上层，再获取下层
     *
     * @returns
     */
    generateLand() {
        // 设置上层
        if (this.topHeight < 0) {
            return null;
        }

        let landWidth = this.generateLandWidth(this.nextWidth, this.minWidth, this.maxWidth, this.maxDistance, this.minDistance);

        let totalHeight = this.getLandTotalHeight();
        let topHeight = this.getLandTopHeight(totalHeight);

        // 上下两层父节点
        let node = new cc.Node();
        node.width = landWidth;
        node.height = totalHeight;
        node.anchorX = 0.5;
        node.anchorY = 0;
        node.y = 0;

        // 上层节点
        let topLand = this.generateSprite("top", landWidth, topHeight, this.getTopSpriteFrame());
        topLand.node.anchorX = 0.5;
        topLand.node.anchorY = 0;
        topLand.node.x = 0;
        topLand.node.y = totalHeight - topHeight;
        node.addChild(topLand.node);

        // 下层节点
        if (topHeight < totalHeight) {
            let bottomLand = this.generateSprite("bottom", landWidth, totalHeight - topHeight, this.getBottomSpriteFrame());
            bottomLand.node.anchorX = 0.5;
            bottomLand.node.anchorY = 0;
            bottomLand.node.x = 0;
            bottomLand.node.y = 0;
            node.addChild(bottomLand.node);
        }

        // 设置靶心
        if (this.spriteFrameDouble == null || this.rewardWidth < 0) {
            return null;
        }

        let rewardLand = this.generateSprite("reward", this.rewardWidth, this.rewardWidth, this.spriteFrameDouble);
        rewardLand.node.anchorX = 0.5;
        rewardLand.node.anchorY = 1;
        rewardLand.node.x = 0;
        rewardLand.node.y = totalHeight;
        node.addChild(rewardLand.node);

        this.lastWidth = this.nextWidth;
        this.nextWidth = landWidth;

        return node;
    },


    /**
     *  获取随机得到的上层纹理
     *
     * @returns
     */
    getTopSpriteFrame() {
        let jsSkin = this.getComponent("Skin");
        if (jsSkin != null) {
            return jsSkin.getZhuziSpriteFrame();
        } else {
            return null;
        }
    },


    /**
     *  获取随机得到下层纹理
     *
     * @returns
     */
    getBottomSpriteFrame() {
        let jsSkin = this.getComponent("Skin");
        if (jsSkin != null) {
            return jsSkin.getZhuziSpriteFrame();
        } else {
            return null;
        }
    },

    /**
     * 获取精灵
     *
     * @param {*} name-名称
     * @param {*} width-宽度
     * @param {*} height-高度
     * @param {*} spriteFrame-纹理
     * @returns
     */
    generateSprite(name, width, height, spriteFrame) {
        if (name == null || width == null || height == null || spriteFrame == null) {
            return null;
        }

        let node = new cc.Node(name);
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.type = cc.Sprite.Type.SLICED;
        node.width = width;
        node.height = height;

        return sprite;
    },

    /**
     * 获取两块陆地的间距，两块陆地之间不能超过梯子最大高度，不能少于两块陆地间距
     *
     * @param {*} lastWidth -上一块宽度
     * @param {*} nextWidth -下一块宽度
     * @param {*} maxDistance -最大间距
     * @param {*} minDistance -两块之间最小间距
     * @returns
     */
    generateDistance(lastWidth, nextWidth, maxDistance, minDistance) {
        if (lastWidth < 0 || nextWidth < 0 || maxDistance < 0) {
            return;
        }

        let min = (lastWidth + nextWidth) / 2 + minDistance;
        if (min > maxDistance) {
            return;
        }

        let more = Math.random() * (maxDistance - min);
        let distance = Math.floor(min) + Math.floor(more);

        return distance;
    },

    /**
     * 获取陆地宽度
     *
     * @param {*} lastWidth -上一块宽度（单块）
     * @param {*} minWidth -最小宽度（单块）
     * @param {*} maxWidth -最大宽度（单块）
     * @param {*} maxDistance -最大宽度（两块水平中心点距离）
     * @param {*} minDistance -最小宽度（两块水平中心点距离）
     * @returns
     */
    generateLandWidth(lastWidth, minWidth, maxWidth, maxDistance, minDistance) {
        if (lastWidth < 0 || minWidth < 0 || maxDistance < 0 || minDistance < 0) {
            return 0;
        }

        let _maxWidth = Math.floor(maxDistance - lastWidth / 2 - minDistance) * 2;

        if (_maxWidth > maxWidth) {
            _maxWidth = maxWidth;
        }

        let more = Math.random() * (_maxWidth - minWidth);
        let width = minWidth + Math.floor(more);

        return width;
    },

    /**
     * 获取陆地总高度
     *
     * @returns {number}  陆地总高度
     */
    getLandTotalHeight() {
        let height = 0;

        if (this.totalHeight <= 0) {
            height = 0;
        } else if (this.totalHeight >= 100) {
            height = cc.winSize.height;
        } else {
            height = Math.floor(cc.winSize.height * this.totalHeight / 100);
        }
        return height;
    },

    /**
     * 获取陆地上层高度
     *
     * @param {number} totalHeight -陆地总高度
     * @returns {number} 上层陆地高度
     */
    getLandTopHeight(totalHeight) {
        let height = 0;

        if (this.topHeight <= 0) {
            height = 0;
        } else if (this.topHeight >= 100) {
            height = totalHeight;
        } else {
            height = Math.floor(totalHeight * this.topHeight / 100);
        }
        return height;
    },

    start() {},

    // update (dt) {},
});