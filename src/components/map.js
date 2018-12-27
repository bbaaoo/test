(function () {
    var mapObj = {
        aMap: '',
        districtExplorer: '',
        city: [],
        dom: '',
        soliceNum: 0,
        delayTime: 0,
        arr: [],
        labelMarker: ''
    }
    init();
    $.ajax({
        url: './obj.json',
        type: 'get',
        contentType:'JSON',
        success: function (data) {
            clearInterval(window.one);
            var arr = []
            for (const [key,val] of Object.entries(data)) {
                for(var i=0;i<capitals.length;i+=1){
                    if(capitals[i].name.indexOf(key) == 0){
                        val.center = capitals[i].center// 设置信息展示坐标
                    }
                }
                for (const [k,v] of Object.entries(val)) {
                    if(k != 'center'){
                        var obj = {[key+"_"+k]: v, center: val.center}
                        arr.push(obj)
                    }
                }
            }
            mapObj.arr = shuffle(arr)
            generateDom()
            window.one = setInterval(() => {
                    generateDom()
            }, 1*60*1000);
        }
    })
    window.onbeforeunload=function(e){     
        clearInterval(window.si);
        clearInterval(window.one);
    // 　　var e = window.event||e;  
    // 　　e.returnValue=("确定刷新当前页面吗？");
    } 
    document.onvisibilitychange = function() {
        if(document.visibilityState=="visible"){
            window.si = setInterval(()=>{
                animation()
            }, mapObj.soliceNum * mapObj.delayTime);
            window.one = setInterval(() => {
                generateDom()
            }, 1*60*1000);
        }else{
            clearInterval(window.si);
            clearInterval(window.one);
        }
    }
    function init() {
        aMap = new AMap.Map('map', {
            mapStyle: "amap://styles/424564d3379c7809883149e377622204",
            showIndoorMap: false, // 是否在有矢量底图的时候自动展示室内地图，PC默认true,移动端默认false
            resizeEnable: false, //是否监控地图容器尺寸变化
            zoomEnable: false, //地图是否可缩放，默认值为true
            dragEnable: false,//地图不可拖动
            doubleClickZoom: false, // 地图是否可通过双击鼠标放大地图，默认为true
            zoom: 4, //初始化地图层级
            center: [105.4976, 38.1697], //初始化地图中心点
            showLabel: false, //不显示地图文字标记
            features: ['bg','road'],
            defaultCursor: 'pointer'
        });
        AMapUI.loadUI(['geo/DistrictExplorer'], function(DistrictExplorer) {
            //创建一个实例
            var districtExplorer = new DistrictExplorer({
                eventSupport: true,
                map: aMap
            });
            mapObj.districtExplorer = districtExplorer
            click();
            mouseEvent();
            var adcodes = 100000
            //各行政区划分
            districtExplorer.loadAreaNode(adcodes, function(error, areaNodes) {
                //清除已有的绘制内容
                // districtExplorer.clearFeaturePolygons();
                //绘制子区域
                districtExplorer.renderSubFeatures(areaNodes, function(feature, i) {
                    // var fillColor = colors[i % colors.length];
                    // var strokeColor = colors[colors.length - 1 - i % colors.length];
                    return {
                        cursor: 'pointer',
                        bubble: true,
                        strokeColor: '#2D61C7', //线颜色
                        strokeOpacity: .5, //线透明度
                        strokeWeight: 1, //线宽
                        // fillColor: '#010122',//填充色
                        fillOpacity: 0, //填充透明度
                    };
                }); 

                //绘制父区域
                districtExplorer.renderParentFeature(areaNodes, {
                    cursor: 'pointer',
                    bubble: true,
                    strokeColor: '#2D61C7', //线颜色
                    strokeOpacity: 1, //线透明度
                    strokeWeight: 2, //线宽
                    // fillColor: '#010122', //填充色
                    fillOpacity: 0, //填充透明度
                });
            });
        });
        //添加各城市坐标
        for(var i=0; i<capitals.length; i+=1){
            var center = capitals[i].center;
            var cityPosition = new AMap.CircleMarker({
                center:center,
                radius: 3+Math.random()*2,//3D视图下，CircleMarker半径不要超过64px
                strokeColor: '#ccc',
                strokeWeight: .5,
                strokeOpacity:0.5,
                fillColor: '#54C22C',
                fillOpacity: .9,
                zIndex:999,//层级设定，设为顶层，方便触发事件
                bubble:true,
                cursor:'pointer',
                extData: capitals[i].name
                // clickable: true,
            })
            //添加城市名
            var cityName = new AMap.Marker({
                position: center,
                content: "<span class='cityName'>"+capitals[i].name.substr(0,2)+"</span>",
                offset: new AMap.Pixel(6, -13),
                bubble: true,
                extData: '',
                // zIndex: 98
            });
            aMap.add(cityName)
            cityPosition.setMap(aMap);
            mapObj.city.push(cityPosition)

            //鼠标滑过提示信息
            var tipMarker = new AMap.Marker({
                offset: new AMap.Pixel(-25, -20),
                bubble:true,
                // zIndex: 9998
            });
            //鼠标悬停在城市定位点
            cityPosition.on('mouseover', function (e) {
                var center = e.target.getCenter();
                mapObj.aMap.add(tipMarker)
                //设定提示位置
                tipMarker.setPosition([center.lng, center.lat]);
                let html = `<div class='hoverTips'>
                    <div class="tipsTitle">${e.target.getExtData()}</div>
                    <div class="tipsData">
                        <div><i class='box' style="background: #F4484F;"></i><span>${center.lng.toFixed(2)}</span></div>
                        <div><i class='box' style="background: #A682E4;"></i><span>${center.lat.toFixed(2)}</span></div>
                        <div><i class='box' style="background: #E48354;"></i><span>${center.lng.toFixed(2)}</span></div>
                        <div><i class='box' style="background: #427FFD;"></i><span>${center.lat.toFixed(2)}</span></div>
                        <div><i class='box' style="background: #115BFD;"></i><span>${center.lng.toFixed(2)}</span></div>
                        <div><i class='box' style="background: #01B1B1;"></i><span>${center.lat.toFixed(2)}</span></div>
                        <div><i class='box' style="background: #EED619;"></i><span>${center.lng.toFixed(2)}</span></div>
                    </div>
                </div>
                `
                //设定内容
                tipMarker.setContent(html)
            })
            cityPosition.on('mouseout', function (e) {
                mapObj.aMap.remove(tipMarker)
            })
        }
        mapObj.aMap = aMap;
        //添加标签
        mapObj.labelMarker = new AMap.Marker({
            position: [69.847209,29.015918],
            offset: new AMap.Pixel(-25, -20),
            bubble:false,
            content: `<div class='label'>
                <div><i class='box' style="background: #F4484F;"></i><span>建设中</span></div>
                <div><i class='box' style="background: #A682E4;"></i><span>正在搬迁</span></div>
                <div><i class='box' style="background: #E48354;"></i><span>当前正在优化</span></div>
                <div><i class='box' style="background: #427FFD;"></i><span>已完成搬迁</span></div>
                <div><i class='box' style="background: #115BFD;"></i><span>已起租</span></div>
                <div><i class='box' style="background: #01B1B1;"></i><span>已完成优化</span></div>
                <div><i class='box' style="background: #EED619;"></i><span>已完成</span></div>
            </div>`
        });
        mapObj.aMap.add(mapObj.labelMarker)
    }
    /* mapObj.aMap.on( 'click',  function (e) {
        console.log(e.lnglat.toString());
        
    }); */
    function click() {
        //外部区域被点击
        mapObj.districtExplorer.on('outsideClick', function(e,feature) {
            console.log('区域外点击');
        });
        var polygons = [];
        mapObj.districtExplorer.on('featureClick', function(e, feature) {
            if(mapObj.aMap.getZoom() <= 4){
                mapObj.aMap.remove(polygons)//清除上次结果
                mapObj.aMap.remove(mapObj.labelMarker)
                polygons = [];
                var bounds = feature.geometry.coordinates;
                if (bounds) {
                    for (var i = 0, l = bounds.length; i < l; i++) {
                        //生成行政区划polygon
                        var polygon = new AMap.Polygon({
                            path: bounds[i],
                            fillOpacity: 0,
                            // fillColor: 'rgb(1,1,34)',
                            strokeColor: '#2D61C7',
                            strokeWeight: 5,
                            bubble:true//事件穿透到地图
                        });
                        polygons.push(polygon);
                    }
                }
                mapObj.aMap.add(polygons)
                mapObj.aMap.setFitView(polygons);//视口自适应
                if(feature.properties.name == '海南省'){
                    mapObj.aMap.setZoomAndCenter(7,feature.properties.center)
                }
            }else{
                mapObj.aMap.remove(polygons);//清除上次结果
                mapObj.aMap.setZoomAndCenter(4,[105.4976, 38.1697]);
                mapObj.aMap.add(mapObj.labelMarker)
            }
        })
    }
    function mouseEvent() {
        /* //鼠标滑过提示信息
        var tipMarker = new AMap.Marker({
            offset: new AMap.Pixel(-25, -20),
            bubble:true,
            zIndex: 9999
        }); */
        //监听feature的hover事件
        mapObj.districtExplorer.on('featureMouseout featureMouseover', function(e, feature) {
            var isHover = e.type === 'featureMouseover';
            if (!isHover) {
                // mapObj.aMap.remove(tipMarker);
            }else{
                // mapObj.aMap.add(tipMarker);
                //设定提示位置
                // tipMarker.setPosition(e.originalEvent.lnglat);
                let html = `<div class='hoverTips'>
                    <div class="tipsTitle">${feature.properties.name}</div>
                    <div class="tipsData">
                        <div><i class='box' style="background: #F4484F;"></i><span>${feature.properties.center[0].toFixed(2)}</span></div>
                        <div><i class='box' style="background: #A682E4;"></i><span>${feature.properties.center[1].toFixed(2)}</span></div>
                        <div><i class='box' style="background: #E48354;"></i><span>${feature.properties.center[0].toFixed(2)}</span></div>
                        <div><i class='box' style="background: #427FFD;"></i><span>${feature.properties.center[1].toFixed(2)}</span></div>
                        <div><i class='box' style="background: #115BFD;"></i><span>${feature.properties.center[0].toFixed(2)}</span></div>
                        <div><i class='box' style="background: #01B1B1;"></i><span>${feature.properties.center[1].toFixed(2)}</span></div>
                        <div><i class='box' style="background: #EED619;"></i><span>${feature.properties.center[1].toFixed(2)}</span></div>
                    </div>
                </div>
                `
                //设定内容
                // tipMarker.setContent(html)
            }
            //设置鼠标悬停时区划的样式
            var polys = mapObj.districtExplorer.findFeaturePolygonsByAdcode(feature.properties.adcode);
            for (var i = 0, len = polys.length; i < len; i++) {
                polys[i].setOptions({
                    fillColor: '#1753f0',
                    fillOpacity: isHover ? 1 : 0,
                    // zIndex: 9
                });
            }
        });

        //监听鼠标在feature上滑动
        mapObj.districtExplorer.on('featureMousemove', function(e, feature) {
            //更新提示位置
            // tipMarker.setPosition(e.originalEvent.lnglat);
        });
    }
     /* 
    执行逻辑
        1. 根据生成所有的显示DOM: dom
        2. 根据arr长度计算出单次展示的数据长度: soliceNum
        3. 根据soliceNum截取dom
        4. 显示截取后的DOM
        5. 
     */
    function generateDom() {
        clearInterval(window.si);
        var arr = mapObj.arr.slice(100, Math.random()*100+200)
        //单次展示的数据长度
        mapObj.soliceNum = Math.ceil(arr.length/(1*60*1000/3200));
        mapObj.dom = [];
        var time = 1*60*1000/arr.length;
        mapObj.delayTime = time <= 400 ? 400 : time
        console.log(arr.length, '-----------------')
        //构建tips标签
        arr.forEach(function(item, index) {
            var str = Object.keys(item)[0]+':'+item[Object.keys(item)[0]]
            mapObj.dom[index] = item.center+',<div class="mapTip foamA" style="width:'+Math.ceil(str.length/11*120)+'px">'+ Object.keys(item)[0]+':'+item[Object.keys(item)[0]] +'</div>';
        })
        animation()
        window.si = setInterval(()=>{
            animation()
        }, mapObj.soliceNum * mapObj.delayTime);
    }
    function animation() {
        console.log(mapObj.dom.length,'--------animation')
        if ( !mapObj.dom.length ) {
            clearInterval(window.si);
            return
        }
        //获取需要执行的成员并在数组中删除
        var oldDom = mapObj.dom.splice(0, mapObj.soliceNum);
        // var oldDom = mapObj.dom.slice(0, mapObj.soliceNum)
        // mapObj.dom = newDom
        oldDom.forEach(function(item, index) {
            setTimeout(() => {
                if(index > mapObj.dom.length-3){
                    console.log(index, mapObj.dom.length)
                }
                var msg = item.split(',')
                var mk = new AMap.Marker({
                    position: [msg[0], msg[1]],
                    // 将 html 传给 content
                    content: msg[2],
                    // 以 icon 的 [center bottom] 为原点
                    offset: new AMap.Pixel(-60, -20),
                    bubble:true,
                    // zIndex: 100
                });
                mapObj.aMap.add(mk);
                setTimeout(() => {
                    mapObj.aMap.remove(mk);//清除
                }, 3200);
            }, mapObj.delayTime * (index + Math.random() - .5), item, index);
        })
    }
    function shuffle(arr) {//数组乱序
        var length = arr.length,
            shuffled = Array(length);
        for (var index = 0, rand; index < length; index++) {
            min = 0, max = index
            if (max == null) {
                max = min;
                min = 0;
            }
            rand = min + Math.floor(Math.random() * (max - min + 1));
            if (rand !== index) shuffled[index] = shuffled[rand];
            shuffled[rand] = arr[index];
        }
        return shuffled;
    }
})();