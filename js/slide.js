function Slide(opt) {
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
    this.speed = 300;
    this.manualSpeed = 100;

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
}

// 调用
Slide.prototype.render = function () {
    var self = this;

    // 添加slide元素
    this.defaults.data.length && this.creatSlide();

    // 添加指示器元素
    this.createIndicator();

    // 添加运动曲线
    this.slide.style.webkitTransitionTimingFunction = 'cubic-bezier(0.21, 0.82, 0.55, 0.94)';
    this.slideWrap.style.cssText = 'overflow: hidden; position: relative;';

    // 初始位置
    this.initSite();

    // 触摸
    this.slide.addEventListener('touchstart', function (e) {
        self.touchstart(e);
    }, false);

    // 移动
    this.slide.addEventListener('touchmove', function (e) {
        self.touchmove(e);
    }, false);

    // 离开
    this.slide.addEventListener('touchend', function (e) {
        self.touchend(e);
    }, false);

    // 自动播放
    this.defaults.auto && this.auto();

    // 监听
    window.addEventListener('resize', function () {
        self.initSite();
        self.slide.style.height = self.item[0].offsetHeight + 'px';
    }, false);
}

// 初始位置
Slide.prototype.initSite = function () {
    var self = this;
    this.slide.style.webkitTransitionDuration = '0ms';
    this.screenWidth = document.documentElement.getBoundingClientRect().width;
    this.criticalPoint = this.screenWidth / 5;
    if (this.num === 0) {
        // 初始化位置
        for (var i = 0; i < this.len; i++) {
            // 如果用style更改样式，px后面不能有;号
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
    setTimeout(function () {
        // 初始化运动速度 必须放到里面才行 不可与reset同时执行
        self.slide.style.webkitTransitionDuration = self.speed + 'ms';
    }, 100);
}

// 重置
Slide.prototype.reset = function() {
    var self = this;
    // 必须等到运动完之后再重置
    setTimeout(function () {
        self.slide.style.webkitTransitionDuration = '0ms';
        self.initSite();
    }, this.manualSpeed);
}

// touchstart
Slide.prototype.touchstart = function(e) {
    this.startX = e.touches[0].pageX;
    this.startY = e.touches[0].pageY;

    // translate(0px, 0px) translateZ(0px)
    this.origin = +this.slide.style.webkitTransform.match(/\((.+?)(?=px)/)[1];
    this.slide.style.webkitTransitionDuration = '0ms';
    clearInterval(this.timer);
}

// touchmove
Slide.prototype.touchmove = function(e) {
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
Slide.prototype.touchend = function(e) {

    // 1.如果函数是直接绑定的，this指向绑定的元素；如果是通过匿名函数调用的，this指向的是对象,因为该函数是被对象调用的
    // 2.如果函数是直接绑定的，这里可以接收event对象；如果是匿名函数调用的，event对象需要在匿名函数上添加后再传过来
    // 3.尽量让this指向构造函数

    var self = this;
    this.manualSpeed = 100;

    // 添加运动
    this.slide.style.webkitTransitionDuration = this.manualSpeed + 'ms';
    
    // 右扫为正 左扫为负
     
    // 反扫
    if (this.size > this.criticalPoint) {
        this.num ++;
        this.slide.style.webkitTransform = 'translate('+ (this.origin + this.screenWidth) +'px, 0px) translateZ(0px)';

        // 重新排序 但第一张图片保留原位
        if (this.num === 1) {
            setTimeout(function () {
                // 这里的this指向的是window 因此需要替换this
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
        this.reset();
    }

    this.size = 0;
    
    // 自动播放
    this.defaults.auto && this.auto();

    // 指示器
    this.indicator();
}

// 指示器同步
Slide.prototype.indicator = function () {
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
Slide.prototype.auto = function autoPlay() {
    var self = this;
    this.timer = setInterval(function () {
        // 添加运动速度
        self.slide.style.webkitTransitionDuration = self.speed + 'ms';
        self.origin = +self.slide.style.webkitTransform.match(/\((.+?)(?=px)/)[1];
        for (var i = 0; i < self.len; i++) {
            self.indicatorsItem[i].className = '';
        }
        self.num --;
        
        if (self.num === -self.len || self.num === 0) {
            // 还原
            self.num = 0;
            self.manualSpeed = self.speed;
            self.reset();
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
Slide.prototype.createIndicator = function () {
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
Slide.prototype.creatSlide = function () {
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
            var p = document.createElement('p');
            p.innerHTML = this.defaults.data[i].text;
            a.appendChild(img);   
            a.appendChild(p);
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