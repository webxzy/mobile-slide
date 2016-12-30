;(function() {
    function mSlide(opt) {
        /*
            autoSpeed 图片的轮播时间 最小2000ms 当设置为false时则表示不用自动播放
            indicator 指示器样式 提供三种 带数字的 digital 圆形的dot 长方形的oblong
            data 传入一个数组渲染轮播图

            支持两种调用方式
                1，手动添加轮播图的html
                2，传入一个data动态渲染

            @author webxzy@qq.com
            version = '1.0';
        */

        // 默认参数
        this.defaults = {
            id: 'slide',
            indicator: 'oblong',
            data: [],
            auto: true,
            autoSpeed: 3000
        }

        // 替换默认参数 只替换自定义的
        for (var k in opt) {
            this.defaults[k] = opt[k];
        }

        // 最小速度限制
        this.defaults.autoSpeed < 2000 ? this.defaults.autoSpeed = 2000 : this.defaults.autoSpeed;

        // 定义共用的属性
        this.slideWrap = document.getElementById(this.defaults.id);
        this.slide = '';
        this.item = '';
        this.len = 0;

        // 该指示器元素在创建的时候就获取了
        this.indicatorsItem = '';

        this.autoSpeed = this.defaults.autoSpeed;
        // 图片的滑动速度太慢会出bug，因此最好不要大于300
        this.speed = 450; // 自动图片运动时间
        this.manualSpeed = 100; // 手动滑动图片运动时间

        this.screenWidth = 0;
        this.num = 0;
        this.criticalPoint = 0;
        this.timer = 0;
        this.size = 0;
        this.left = 0;
        this.startX = 0;
        this.startY = 0;

        // 如果为0则说明是静态添加的html
        if (this.defaults.data.length === 0) {
            this.slide = document.querySelector('.slide-content');
            this.item = this.slide.querySelectorAll('a');
            this.len = this.item.length;
            this.slide.style.height = this.item[0].offsetHeight + 'px';
        }

        this.render();
    }

    // 调用
    mSlide.prototype.render = function () {
        var self = this;

        // 添加slide元素
        this.defaults.data.length && this.creatSlide();

        // 添加指示器元素
        this.createIndicator();

        // 添加运动曲线
        this.slide.style.webkitTransitionTimingFunction = 'cubic-bezier(0.21, 0.82, 0.55, 0.94)';
        this.slideWrap.style.position = 'relative';
        this.slideWrap.style.overflow = 'hidden';

        // 初始
        this.initSite();

        // 自动播放
        this.defaults.auto && this.auto();

        // 监听
        window.addEventListener('resize', function () {
            this.slide.ontouchstart = null;
            this.slide.ontouchmove = null;
            this.slide.ontouchend = null;
            self.initSite();
            self.slide.style.height = self.item[0].offsetHeight + 'px';
        }, false);
    }

    // 初始位置
    mSlide.prototype.initSite = function () {
        var self = this;
        this.slide.style.webkitTransitionDuration = '0ms';
        this.screenWidth = document.documentElement.getBoundingClientRect().width;
        this.criticalPoint = this.screenWidth / 5;
        if (this.num === 0) {
            // 初始化位置
            for (var i = 0; i < this.len; i++) {
                this.item[i].style.left = this.screenWidth * i + 'px';
            }
            // 把最后面的元素移到最前面
            this.item[this.len-1].style.left = -this.screenWidth + 'px';
        }

        // 当横竖屏切换时给每个项重新定义宽度和位置
        else if (this.num > 0) {
            // 左 → 右
            for (var i = 0; i < this.len; i++) {
                this.item[this.len - 1 - i].style.left = -this.screenWidth * (i + 1) + 'px';
            }
        }
        else if (this.num < 0) {
            // 左 ← 右
            for (var i = 0; i < this.len; i++) {
                this.item[i].style.left = this.screenWidth * i + 'px';
            }

            // 倒数第一个由横屏切竖屏时，把第一个拉到最右边。
            if (this.num === 1 - this.len) {
                this.item[0].style.left = this.screenWidth * this.len + 'px';
            }
        }

        if (this.num === 1 || this.num === -1) {
            this.item[0].style.left = 0;
        }

        // 初始化容器的位置
        this.slide.style.webkitTransform = 'translate('+ this.num * this.screenWidth +'px, 0px) translateZ(0px)';

        self.slide.ontouchstart = function (e) {self.touchstart(e)};
        self.slide.ontouchmove = function (e) {self.touchmove(e)};
        self.slide.ontouchend = function (e) {self.touchend(e)};
        // console.log('重置完成');
    }

    // 重置
    mSlide.prototype.reset = function(speed) {
        // console.log('准备重置'); // 这个过程中 不让滑动
        var self = this;
        // 必须等到运动完之后再重置
        setTimeout(function () {
            // console.log('开始重置');
            self.initSite();
        }, speed);
    }

    // touchstart
    mSlide.prototype.touchstart = function(e) {
        this.startX = e.touches[0].pageX;
        this.startY = e.touches[0].pageY;

        // translate(0px, 0px) translateZ(0px)
        this.origin = +this.slide.style.webkitTransform.match(/\((.+?)(?=px)/)[1];
        this.slide.style.webkitTransitionDuration = '0ms';
        clearInterval(this.timer);
    }

    // touchmove
    mSlide.prototype.touchmove = function(e) {
        var moveX = e.touches[0].pageX;
        var moveY = e.touches[0].pageY;
        // 移动距离
        this.size = moveX - this.startX;
        this.slide.style.webkitTransform = 'translate('+ (this.origin + this.size) +'px, 0px) translateZ(0px)';

        // 阻止左右移动时的浏览器默认事件
        if (Math.abs(moveX - this.startX) > Math.abs(moveY- this.startY)) {
            e.preventDefault();
        }
    }

    // touchend
    mSlide.prototype.touchend = function(e) {

        var self = this;
        // 添加图片滚动速度
        this.slide.style.webkitTransitionDuration = this.manualSpeed + 'ms';
        
        // 右扫为正 左扫为负
         
        // 反扫
        if (this.size > this.criticalPoint) {
            this.num ++;
            this.slide.style.webkitTransform = 'translate('+ (this.origin + this.screenWidth) +'px, 0px) translateZ(0px)';

            // 重新排序 但第一张图片保留原位
            if (this.num === 1) {
                setTimeout(function () {
                    for (var i = self.len - 1; i > 0; i--) {
                        self.item[self.len - i].style.left = -(self.screenWidth * i) + 'px';
                    }
                }, this.manualSpeed);
            }

            // 最后一张 把第一张拉到最左侧
            if (this.num === this.len - 1) {
                this.item[0].style.left = -this.screenWidth * this.len + 'px';
            }
        }

        // 正扫
        else if (this.size < - this.criticalPoint) {
            this.num --;
            this.slide.style.webkitTransform = 'translate('+ (-this.screenWidth + this.origin) +'px, 0px) translateZ(0px)';
            //倒数第二张
            if (this.num === 2 - this.len) {
                // 把倒数第一张图拉回来
                this.item[this.len-1].style.left = this.screenWidth * (this.len - 1) + 'px';
            }

            // 倒数第一张
            if (this.num === 1 - this.len) {
                // 把左边第一张拉到最右边
                this.item[0].style.left = this.screenWidth * this.len + 'px';
            }
        }
        // 回到原位
        else {
            this.slide.style.webkitTransform = 'translate('+ this.origin +'px, 0px) translateZ(0px)';
        }

        if (this.num === 1 || this.num === -1) {
            this.item[0].style.left = 0;
        }

        // 还原
        if (this.num === -this.len || this.num === this.len || this.num === 0) {
            this.num = 0;
            this.slide.ontouchstart = null;
            this.slide.ontouchmove = null;
            this.slide.ontouchend = null;
            this.reset(this.manualSpeed);
        }

        this.size = 0;
        
        // 自动播放
        this.defaults.auto && this.auto();

        // 指示器
        this.indicator();
    }

    // 指示器同步
    mSlide.prototype.indicator = function () {
        for (var i = 0; i < this.len; i++) {
            this.indicatorsItem[i].className = '';
        }
        if ( this.num < 0) {
            // 正扫
            var i = Math.abs(this.num);
            if (i === this.len) {
                i = 0;
            }
            this.indicatorsItem[i].className = 'active';
        }
        else {
            // 反扫
            var k = this.len - this.num;
            if (k === this.len) {
                k = 0;
            }
            this.indicatorsItem[k].className = 'active';
        }
    }   

    // 自动
    mSlide.prototype.auto = function autoPlay() {
        var self = this;
        this.timer = setInterval(function () {
            // 添加图片滚动速度
            self.slide.style.webkitTransitionDuration = self.speed + 'ms';
            self.origin = +self.slide.style.webkitTransform.match(/\((.+?)(?=px)/)[1];
            for (var i = 0; i < self.len; i++) {
                self.indicatorsItem[i].className = '';
            }
            self.num --;
            
            if (self.num === -self.len || self.num === 0) {
                // 还原
                self.num = 0;
                self.slide.ontouchstart = null;
                self.slide.ontouchmove = null;
                self.slide.ontouchend = null;
                self.reset(self.speed);
            }
            self.slide.style.webkitTransform = 'translate('+ (-self.screenWidth + self.origin) +'px, 0px) translateZ(0px)';
            if (self.num <= 0) {
                // 顺序播放
                if (self.num === 2 - self.len) {
                    // 倒数第二张
                    self.item[self.len-1].style.left = self.screenWidth * (self.len - 1) + 'px';
                }
                if (self.num === 1 - self.len) {
                    // 倒数第一张
                    self.item[0].style.left = self.screenWidth * self.len + 'px';
                }
                self.indicatorsItem[Math.abs(self.num)].className = 'active';
            }
            else {
                // 反扫
                if (self.num === 1) {
                    // 最后一张
                    self.item[0].style.left = 0;
                }
                self.indicatorsItem[self.len - self.num].className = 'active';
            }
        }, this.autoSpeed);
    }

    // 创建指示器元素
    mSlide.prototype.createIndicator = function () {
        var indicator = document.createElement('ol');
        indicator.className = 'slide-indicator' + ' ' + this.defaults.indicator + '-indicator';
        var indicatorsItem = '';
        for (var i = 0; i < this.len; i++) {
            var item = document.createElement('li');
            if (this.defaults.indicator === 'digital') {
                item.innerHTML = i + 1;
            }
            indicator.appendChild(item);
        }
        this.slideWrap.appendChild(indicator);
        this.indicatorsItem = document.querySelector('.slide-indicator').querySelectorAll('li');
        this.indicatorsItem[0].className = 'active';
    }

    // 创建slide元素
    mSlide.prototype.creatSlide = function () {
        var self = this;
        this.len = this.defaults.data.length;
        var slideContent = document.createElement('div');
        var list = this.defaults.data;
        slideContent.className = 'slide-content';
        for (var i = 0; i < this.len; i++) {
            var a = document.createElement('a');
            var img = document.createElement('img');
            a.href = list[i].href;
            img.src = list[i].src;
            img.alt = list[i].alt;
            if (this.defaults.data[i].text) {
                // 如果text有内容则创建p标签
                var span = document.createElement('span');
                span.innerHTML = this.defaults.data[i].text;
                a.appendChild(img);   
                a.appendChild(span);
            }
            else {
                a.appendChild(img);
            }
            slideContent.appendChild(a);
        }

        this.slideWrap.appendChild(slideContent);
        this.slide = document.querySelector('.slide-content');
        this.item = slideContent.querySelectorAll('a');

        // 初始化高度
        var oImg = new Image;
        oImg.src = list[0].src;
        oImg.onload = function() {
            // 图片被成功加载后赋高度
            self.slide.style.height = self.item[0].offsetHeight + 'px';
        }
    }

    window.mSlide = mSlide;
})();