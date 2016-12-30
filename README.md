# mSlide 移动端轮播图
没有什么依赖文件，使用原生js封装的，可以支持动态和静态两种调用模式。

## Usage
1.在html页面引入js和css文件
```
// css
<link rel="stylesheet" type="text/css" href="css/slide.css">

// javascript
<script type="text/javascript" src="js/slide.js"></script>
```

2.创建一个根元素
```
<div id="slide"></div>
```

3.json格式的数据
```
var data = [{
    href: 'javascript:;',
    src: 'img/pic1.png',
    alt: '这里是图片的alt内容1',
    text: '一款简单、好用的移动端自适应轮播图'
},{
    href: 'javascript:;',
    src: 'img/pic2.png',
    alt: '这里是图片的alt内容2',
    text: '支持静态网页和动态渲染两种初始模式'
},{
    href: 'javascript:;',
    src: 'img/pic3.png',
    alt: '这里是图片的alt内容3',
    text: '在横竖屏切换时可自动适应屏幕'
},{
    href: 'javascript:;',
    src: 'img/pic4.png',
    alt: '这里是图片的alt内容4',
    text: '提供了三套指示器样式，也可以自定义'
},{
    href: 'javascript:;',
    src: 'img/pic5.png',
    alt: '这里是图片的alt内容4',
    text: '还可以更改轮播时间、滑动速度和自动播放'
},{
    href: 'javascript:;',
    src: 'img/webxzy-shadow.png',
    alt: 'webxzy@qq.com'
}];
```

4.调用
```
var slide = new Slide({
    id: 'slide',
    indicator: 'oblong',
    data: data,
    auto: true,
    aotoDpeed: 3000
});
```

## 静态html调用
```
<div id="slide">
    <div class="slide-content">
        <a href="http://www.baidu.com">
            <img src="img/pic1.png" alt="">
            <span>这是一些图片的说明文字，当前是第1张</span>
        </a>
        <a href="javascript:;">
            <img src="img/pic2.png" alt="">
            <span>这是一些图片的说明文字，当前是第2张</span>
        </a>
        <a href="javascript:;">
            <img src="img/pic3.png" alt="">
            <span>这是一些图片的说明文字，当前是第3张</span>
        </a>
        <a href="javascript:;">
            <img src="img/pic4.png" alt="">
            <span>这是一些图片的说明文字，当前是第4张</span>
        </a>
        <a href="javascript:;">
            <img src="img/pic5.png" alt="">
            <span>这是一段很长很长很长很长很长很长很长很长很长很长的说明文字，当前是第5张</span>
        </a>
        <a href="javascript:;">
            <img src="img/webxzy-shadow.png" alt="webxzy@qq.com">
            <span>这是一些图片的说明文字，当前是第6张</span>
        </a>
    </div>
</div>

// 这里去掉了data参数
var slide = new Slide({
    id: 'slide',
    indicator: 'oblong',
    auto: true,
    aotoDpeed: 3000
});
```


## API
- indicator 指示器样式
    - oblong 长方形 默认
    - dot 圆
    - digital 带数字的圆
- auto 自动播放
    - true 自动播放 默认
    - false 不自动播放
- aotoSpeed 自动播放速度 默认3000ms

webxzy@qq.com

