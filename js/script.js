// 此对象依赖于echerts.js,地图GeoJson
function mapEcharts(ele,echarts){
	this.ele=ele;
	this.echarts=echarts;
	this.chart;
	//this.count=0;
}

mapEcharts.prototype.DropMapGeo=function(mapName,geoJsonData,option,callback){
	var ele=this.ele;
	var echarts=this.echarts;
	var regionName=mapName;
	var chart=this.chart;
	this.count++;
	if(chart){
		chart.dispose();
	}
	echarts.registerMap(regionName,geoJsonData);
	chart=echarts.init(ele);
	var options;
	options={
		backgroundColor: option.backgroundColor? option.backgroundColor:"#ffffff",
		// visualMap: {
		// 	show:false,
		// 	min: 0,
		// 	max: 200,
		// 	calculable: true,
		// 	inRange: {
		// 		color: option.visualMapColor?option.visualMapColor:['#50a3ba', '#eac736', '#d94e5d']
		// 	},
		// 	textStyle: {
		// 		color: '#fff'
		// 	}
		// },
		tooltip:{
			trigger:'axis',
			axisPointer:{
				type:"shadow"
			}
		},
		geo: {
			map: regionName,
			center:option.center,
		    roam:true,   //可以缩放地图
		    //selectedMode:'single',
		     zoom:option.zoom? option.zoom :1,
		    label: {
		      	show:true
		    },
		    itemStyle: {
		      	normal: {
		       		areaColor: '#00CED1',
		       		borderColor: '#111'
		       	},
		       	emphasis: {
		       		areaColor: '#f2eca6'
		       	}
		    },
			regions:option.regionsData
		},
		series:[
			{
				name:regionName,
                type : "map",
                geoIndex:0,
                coordinateSystem:'geo',
                map : regionName,
                // zoom:1,
                roam : true,
                label:{
                       show:true,
                       color:"#FFF"
                    },
                coordinateSystem:'geo',
                data : option.seriesData

            }
		],
		animation:true
	};
	chart.setOption(options);
	this.chart=chart;
	if(callback){
		callback();
	}
	return this;
}

//设置地图块的颜色
// params:{   //选中地图区域对象
// 	"data":{"name":"四川","value":0,"id":51,"itemStyle":{"color":"#00ced1"},"cp":[101.9199, 30.1904]},
// 	dataIndex:4,
// 	"name":"四川省",
// 	"value":0,
// 	"color":"#00ced1",
// 	"seriesName":"china",
// 	"seriesType":"map"
// }
//color:颜色，支持普通颜色和渐变
// var color={					//线性渐变
// 	type: 'linear',
//     x: 0,
//     y: 0,
//     x2: 1,
//     y2: 1,
//     colorStops: [{
//         offset: 0, color: 'red' // 0% 处的颜色
//     }, {
//         offset: 1, color: 'blue' // 100% 处的颜色
//     }],
//     globalCoord: false // 缺省为 false
// };
// var color={           //径向渐变
//     type: 'radial',
//     x: 0.5,
//     y: 0.5,
//     r: 0.5,
//     colorStops: [{
//         offset: 0, color: 'red' // 0% 处的颜色
//     }, {
//         offset: 1, color: 'blue' // 100% 处的颜色
//     }],
//     globalCoord: false // 缺省为 false
// }
mapEcharts.prototype.setMapColor=function(params,color){
	var option=this.chart.getOption();
	for(var i=0; i<option.series.length;i++){
		if(option.series[i].type==params.seriesType && params.seriesType=="map" && option.series[i].name==params.seriesName){
			option.series[i].data[params.dataIndex].itemStyle.color=color;
		}
	}
	this.chart.setOption(option);
}
//设置地图块的文字样式
mapEcharts.prototype.setMapText=function(params,textStyle){
	var option=this.chart.getOption();
	console.log(option);
	for(var i=0;i<option.geo[0].regions.length;i++){
		if(option.geo[0].regions[i].name==params.data.name){
			option.geo[0].regions[i].label.fontFamily=textStyle.fontFamily;
			option.geo[0].regions[i].label.fontSize=textStyle.fontSize;
			option.geo[0].regions[i].label.fontWeight=textStyle.fontWeight;
			option.geo[0].regions[i].label.fontStyle=textStyle.fontStyle;
			option.geo[0].regions[i].label.color=textStyle.color;
		}
	}
	this.chart.setOption(option);
}


//地图上绘制线条
//linesArr连接线段之间的点，如[[103.88,30.82],[104.05,30.70],[104.10,30.67],[104.43,30.85]]
//isShowSpot:是否显示线段之间的点，默认显示
//lineOption:线条的参数
mapEcharts.prototype.setDropLines=function(lineName,linesData,lineOption){
	var linesArr=[];
	var markPointData=[];
	for(var i=0;i<linesData.length;i++){
		markPointData.push({
			"name":linesData[i].name,
			"coord":linesData[i].coordinate
		});
		if(i==linesData.length-1){
			break;
		}
		linesArr.push(
			{
				"coords":[linesData[i].coordinate,linesData[i+1].coordinate],
				"lineStyle":{
					"color": lineOption ? lineOption.color : "#fff",
					"width":lineOption ? lineOption.width : 1,
					"type":lineOption ? lineOption.type : "solid",
					"opacity":lineOption ? lineOption.opacity : 0.6
				}
			}
		);
	}
	var option=this.chart.getOption();
	var item={
        name:lineName,
        type: 'lines',
        polyline:true,
        zlevel: 2,
        symbolSize: 10,
        data:linesArr,
        markPoint:{
        	symbol:'circle',
			symbolSize:5,
			data:markPointData
        }
	};
	option.series.push(item);
	this.chart.setOption(option);
	return item;                    //返回绘制的线对象
}

//清除线段
mapEcharts.prototype.clearLine=function(lineObj){
	var option=this.chart.getOption();
	//console.log(lineObj);
	for(var i=0;i<option.series.length;i++){
		//if顺序不能变，先清除轨迹对应的动画，再清除轨迹线段
		if(option.series[i].name==lineObj.name+"Animation" && option.series[i].type==lineObj.type){
			option.series.splice(i,1);
			i-=1;
		}
		if(option.series[i].name==lineObj.name && option.series[i].type==lineObj.type){
			option.series.splice(i,1);
			i=i-1;
		}
	}
	this.chart.setOption(option,true);
}
//为线条设置动画
//trajectoryLine：运动轨迹线
//lineAnimationOption:动画参数
//isStartUp:是否启用动画，true开启动画，false关闭动画
mapEcharts.prototype.setLineAnimation=function(trajectoryLine,lineAnimationOption,isStartUp){
	var option=this.chart.getOption();
	var coordsArr=[];
	for(var i=0;i<trajectoryLine.data.length;i++){
		coordsArr.push(trajectoryLine.data[i].coords[0]);
		if(i==trajectoryLine.data.length-1){
			coordsArr.push(trajectoryLine.data[i].coords[1]);
		}
	}
	var item={
        name: trajectoryLine.name + 'Animation',
        type: 'lines',
        polyline:true,
        zlevel:Math.random()*10,
        //zlevel: Math.round(Math.random()*100),
        effect: {
            show: isStartUp ? isStartUp : true,
            period: lineAnimationOption ? lineAnimationOption.period : 6,
            delay: lineAnimationOption ? lineAnimationOption.delay : 0,					
			constantSpeed: lineAnimationOption ? lineAnimationOption.constantSpeed : 0,    
			symbol: lineAnimationOption ? lineAnimationOption.symbol : 'circle',     
			color: lineAnimationOption ? lineAnimationOption.color : '#fff',		 
			symbolSize: lineAnimationOption ? lineAnimationOption.symbolSize : 3,         
			trailLength: lineAnimationOption ? lineAnimationOption.trailLength : 0.2,      
			loop:lineAnimationOption ? lineAnimationOption.loop : true,       
        },
        lineStyle: {
            normal: {
                width: 0,
                opacity:0.6
            }
        },
        data: [
        	{coords:coordsArr}
        ]
    }
	option.series.push(item);
	//console.log(item);
	this.chart.setOption(option);
	return item;
}
//lineAnimation:动画对象，isClose：是否关闭动画，true：关闭动画，false：开启动画
mapEcharts.prototype.closeLineAnimation=function(lineAnimation,isClose){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==lineAnimation.name && option.series[i].type==lineAnimation.type){
			option.series[i].effect.show=isClose? !isClose : false;
		}
	}
	this.chart.setOption(option);
}

//设置线的颜色
mapEcharts.prototype.setLineStyle=function(line,lineStyle){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==line.seriesName && option.series[i].type=='lines'){
			if(lineStyle.color){
				option.series[i].data[line.dataIndex].lineStyle.color= lineStyle.color;
			}
			if(lineStyle.width){
				option.series[i].data[line.dataIndex].lineStyle.width=lineStyle.width;
			}
			if(lineStyle.type){
				option.series[i].data[line.dataIndex].lineStyle.type=lineStyle.type;
			}
			if(lineStyle.opacity){
				option.series[i].data[line.dataIndex].lineStyle.opacity=lineStyle.opacity;
			} 
			break;
		}
	}
	this.chart.setOption(option);
}

//地图上绘制点
mapEcharts.prototype.setDropSpot=function(spotsName,spotData,spotOption){
	var option=this.chart.getOption();
	var seriesData=[];
	var itemSeries=[];
	for(var i=0;i<spotData.length;i++){
		seriesData.push(
			{
				"name":spotData[i].text,
				"value":spotData[i].coordinate,
				"itemStyle":{
					"color":spotOption? spotOption.color : '#ddd',
					// "borderColor":spotOption? spotOption.borderColor : '#ddd',
					// "borderWidth":spotOption? spotOption.borderWidth : 1,
					// "borderType":spotOption? spotOption.borderType : "solid",
					"opacity":spotOption? spotOption.opacity : 1
				},
				"symbol":spotOption? spotOption.symbol : 'circle',
				"symbolSize":spotOption? spotOption.symbolSize : 10,
				"symbolOffset":spotOption? spotOption.symbolOffset : [0,0],
				"label":{
					"show":true,
					"color":spotOption? spotOption.color : '#000',
					"formatter":"{b}",
					"fontSize":12,
					"offset":[0,-15]
				}
			}
		);
		itemSeries.push({
			seriesName: spotsName,
        	seriesType: 'scatter',
        	data: seriesData[i],
        	dataIndex:i
		});
	}
	option.series.push({
		name: spotsName,
        type: 'scatter',
        coordinateSystem: 'geo',
        data: seriesData,
		symbol:"circle",
        symbolSize: 12,
        hoverAnimation:false,
        zlevel:1000,
        label: {
            normal: {
                show: true
            },
            emphasis: {
                show: false
            }
        }
	});
	this.chart.setOption(option);
	return itemSeries;
}

//设置标记点的图标文字
//text:文字描述
//textOption:文字样式描述
mapEcharts.prototype.setSpotText=function(params,text,textOption){
	var option=this.chart.getOption();
	var falg=true;
	if( isNaN(textOption.offset[0]) || isNaN(textOption.offset[0])){
		falg=false;
	}
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==params.seriesName && params.seriesType=="scatter"){ 
			if(text && text !=""){
				option.series[i].data[params.dataIndex].name=text;
			}
			if(textOption.color && textOption.color!=""){
				option.series[i].data[params.dataIndex].label.color=textOption.color;
			}
			if(textOption.fontSize){
				option.series[i].data[params.dataIndex].label.fontSize=textOption.fontSize;
			}
			if(textOption.offset && textOption.offset.length==2 &&  falg){
				option.series[i].data[params.dataIndex].label.offset=textOption.offset;
			}
			break;
		}
	}
	this.chart.setOption(option);
}


//设置标记点的图片或图标类型
mapEcharts.prototype.setSoptImg=function(params,imgOption){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==params.seriesName && params.seriesType=="scatter"){
			if(imgOption.symbol){
				option.series[i].data[params.dataIndex].symbol=imgOption.symbol;
			}
			if(imgOption.symbolSize){
				option.series[i].data[params.dataIndex].symbolSize=imgOption.symbolSize;
			}
			if(imgOption.color){
				option.series[i].data[params.dataIndex].itemStyle.color=imgOption.color;
			}
			break;
		}
	}
	this.chart.setOption(option);
}

//清除点
mapEcharts.prototype.clearSpot=function(params){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		for(var j=0;j<params.length;j++){
			if(option.series[i].name==params[j].seriesName && params[j].seriesType=="scatter"){
				for(var k=0;k<option.series[i].data.length;k++){
					if(option.series[i].data[k].name==params[j].data.name && option.series[i].data[k].name==params[j].data.name){
						option.series[i].data.splice(k,1);
						break;
					}
				}
			}
		}
	}
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].data.length==0){
			option.series.splice(i,1);
		}
	}
	this.chart.setOption(option,true);
}

//清除所有绘制图形
mapEcharts.prototype.clearAll=function(params){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].type!="map"){
			option.series.splice(i,1);
			i-=1;
		}
	}
	this.chart.setOption(option,true);
}

//监听事件
mapEcharts.prototype.linster=function(eventName,callback){
     this.chart.on(eventName,function(params){
     	var param={};
     	if(params.seriesType=="scatter"){
     		param.data=params.data;
     		param.seriesName=params.seriesName;
     		param.seriesType="scatter";
     		param.dataIndex=params.dataIndex;
     		param.event=params.event;
     	}else if(params.seriesType=="lines"){
     		param.data=params.data;
     		param.seriesName=params.seriesName;
     		param.seriesType="lines";
     		param.dataIndex=params.dataIndex;
     		param.event=params.event;
     	}
     	else{
     		param=params;
     	}
        callback(param);
     });
}


//叠加柱状图
mapEcharts.prototype.overlyBarChart=function(geoData,parData){
	var that=this;
	var myChart=this.chart;
	var geoData=geoData;
	var parData=parData;
	renderEachCity();
	var throttledRenderEachCity = throttle(renderEachCity, 0);
	this.chart.on('geoRoam',throttledRenderEachCity);
	//this.chart.setOption(option);
	function renderEachCity(){
		var option={
			xAxis:[],
			yAxis:[],
			grid:[],
			series:[]
		};
		echarts.util.each(parData,function(dataItem,idx){
			var geoCoord = geoData[dataItem.regionName];
	        var coord = myChart.convertToPixel('geo', geoCoord);  //地理坐标转换
	        idx += '';

	       //inflationData = [30,50,20];
	        inflationData=dataItem.yData;
	        option.xAxis.push({
	            id: idx,
	            gridId: idx,
	            type: 'category',
	            //name: dataItem[0],
	            nameLocation: 'middle',
	            nameGap: 3,
	            splitLine: {
	                show: false
	            },
	            axisTick: {
	                show: false
	            },
	            axisLabel: {
	                show: false
	            },
	            axisLine: {
	                onZero: false,
	                lineStyle: {
	                    color: '#666'
	                }
	            },
	            data:dataItem.xData,
	            z: 100

	        });
	        option.yAxis.push({
	            id: idx,
	            gridId: idx,
	            splitLine: {
	                show: false
	            },
	            axisTick: {
	                show: false
	            },
	            axisLabel: {
	                show: false
	            },
	            axisLine: {
	                show: false,
	                lineStyle: {
	                    color: '#1C70B6'
	                }
	            },
	            z: 100
	        });
	        option.grid.push({
	            id: idx,
	            width: 30,
	            height: 40,
	            left: coord[0] - 15,
	            top: coord[1] - 15,
	            z: 100
	        });
	        option.series.push({
	            id: idx,
	            type: 'bar',
	            xAxisId: idx,
	            yAxisId: idx,
	            barGap: 0,
	            barCategoryGap: 0,
	            data: inflationData,
	            z: 100,
	            itemStyle: {
	                normal: {
	                    color: function(params){
	                        // 柱状图每根柱子颜色
	                        var colorList = ['#F75D5D','#59ED4F','#4C91E7'];
	                        return colorList[params.dataIndex];
	                    }
	                }
	            }
	        });
		});
		myChart.setOption(option);
		//点击图像
		myChart.on('click',function(e){
			if(e.componentSubType=="map"){
				return;
			}
			var zhedang=that.creatWrap();
			var divObj = document.createElement('div');
			var divX = getMousePos()['x']; 
            var divY = getMousePos()['y']; 
            $(divObj).css({
                'width': 250,
                'height': 180,
                'border': '1px solid #ccc',
                'position': 'absolute',
                'top': divY,
                'left': divX
            });
            $(zhedang).append(divObj);
			that.BarChart(divObj,parData[e.seriesId]);;
			that.clearWrap(zhedang);
		});
	}
}

//叠加饼形图
mapEcharts.prototype.overlyPieChart=function(geoData,parData){
	var myChart=this.chart;
	var geoData=geoData;
	var parData=parData;
	renderEachCityPie();
	var throttledRenderEachCity = throttle(renderEachCityPie, 0);
	this.chart.on('geoRoam',throttledRenderEachCity);
	function renderEachCityPie(){
		var option={
			// xAxis:[],
			// yAxis:[],
			// grid:[],
			tooltip:[],
			series:[]
		};
		echarts.util.each(parData,function(dataItem,idx){
			var geoCoord = geoData[dataItem.regionName];
	        var coord = myChart.convertToPixel('geo', geoCoord);  //地理坐标转换
	        idx += '';

	       //inflationData = [30,50,20];
	        inflationData=dataItem.yData;
	        // option.series.tooltip.push({
	        // 	trigger: 'item'
	        // });
	        option.series.push({
	            id: idx,
	            type: 'pie',
	            radius : '5%',
            	center:coord,
	            data: inflationData,
	            z: 100,
	            itemStyle: {
	                normal: {
	                    color: function(params){
	                        // 柱状图每根柱子颜色
	                        var colorList = ['#F75D5D','#59ED4F','#4C91E7'];
	                        return colorList[params.dataIndex];
	                    }
	                }
	            },
	            labelLine:{
	            	show:false
	            }
	        });
		});
		myChart.setOption(option);
	}
}

// 缩放和拖拽时叠加图跟着改变
function throttle(fn, delay, debounce) {
    var currCall;
    var lastCall = 0;
    var lastExec = 0;
    var timer = null;
    var diff;
    var scope;
    var args;

    delay = delay || 0;

    function exec() {
        lastExec = (new Date()).getTime();
        timer = null;
        fn.apply(scope, args || []);
    }

    var cb = function() {
        currCall = (new Date()).getTime();
        scope = this;
        args = arguments;
        diff = currCall - (debounce ? lastCall : lastExec) - delay;

        clearTimeout(timer);

        if (debounce) {
            timer = setTimeout(exec, delay);
        } else {
            if (diff >= 0) {
                exec();
            } else {
                timer = setTimeout(exec, -diff);
            }
        }

        lastCall = currCall;
    };

    return cb;
}

//生成柱状图
mapEcharts.prototype.BarChart=function(ele,data){
	console.log(ele);
	var myChart = this.echarts.init(ele);
    var option = {
        backgroundColor: 'rgba(255,255,255,.3)',
        legend: {
            data: data.xData
        },
        xAxis: [
            {

                type: 'category',
                data: data.xData
            }
        ],
        yAxis: [
            {
                splitLine: {
                    show: false
                },
                type: 'value'
            }
        ],
        series: [
            {
            	name: 'bar'+data.regionName,
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: function(params){
                            var colorList = ['#F75D5D','#59ED4F','#4C91E7'];
                            return colorList[params.dataIndex];
                        },
                        label: {
                            show: true,
                            position: 'top',
                            textStyle: {
                                color: '#000'
                            }
                        }
                    }
                },
                data: data.yData
            }
        ]
    };
    myChart.setOption(option);
    return myChart;
}

//生成遮罩层
mapEcharts.prototype.creatWrap=function(){
	var parentEle=$(this.ele).parent();
	if(!parentEle){
		return;
	}
    var zheDang = document.createElement('div');
    $(zheDang).addClass('zhedang').css({
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,.2)'
    });
    $(parentEle).append($(zheDang));
    return zheDang;
}

// 去掉遮挡层
mapEcharts.prototype.clearWrap=function(element){
	$(element).click(function(e){
		this.remove();
	});
}

// 获取鼠标横纵坐标
function getMousePos(e) {
    var e = event || window.event;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var x = e.pageX || e.clientX + scrollX;
    var y = e.pageY || e.clientY + scrollY;
    // console.log(x,y)
    return {'x': x,'y': y};
}


//叠加热力图
mapEcharts.prototype.overlyHeatMap=function(heatMapName,seriesData){
	var option=this.chart.getOption();
	var item={
		"name":heatMapName,
		"type": 'heatmap',
        "coordinateSystem": 'geo',
        "data":seriesData

	};
	option.visualMap={
		show:false,
			min: 0,
			max: 200,
			calculable: true,
			seriesIndex:option.series.length,
			inRange: {
				color:['#d94e5d','#eac736','#50a3ba']
			},
			// textStyle: {
			// 	color: '#fff'
			// }
	};
	option.series.push(item);
	this.chart.setOption(option);
}
//叠加图片
mapEcharts.prototype.overlyImg=function(name,coords,imgOption){
	var myChart=this.chart;
	rendImg();
	myChart.on("geoRoam",function(){
		rendImg();
	});
	function rendImg(){
		var option=myChart.getOption();
		var arr=myChart.convertToPixel('geo',coords);
		if(!option.graphic){
			option.graphic=[{}];
			option.graphic[0].elements=[];
		}
		for(var j=0;j<option.graphic[0].elements.length;j++){
			if((option.graphic[0].elements[j].id==name) && (option.graphic[0].elements[j].type=="image")){
				option.graphic[0].elements.splice(j,1);
				j-=1;
			}
		}
		var item={
			type:'image',
			id:name,
			z:1,
			zlevel:999,
			style:{
				image:imgOption.imgPath,
				x:arr[0]-imgOption.width/2,
				y:arr[1]-imgOption.height/2,
				width:imgOption.width,
				height:imgOption.height
			}
		};
		option.graphic[0].elements.push(item);
		myChart.setOption(option);
	}
}
//叠加贝塞尔曲线
mapEcharts.prototype.overlyBezierCurve=function(barLineID,dazData,bazOption){
	if(!barLineID){
		return;
	}
	var falg=false;  //鼠标是否缩放过
	var myChart=this.chart;
	var dazData=dazData;
	var arr=[];
	arr=dazData;
	var data=[];
	dropBezierCurve();
	//var throttledRenderEachCity = throttle(dropBezierCurve, 0);
	this.chart.on("geoRoam",function(){
		falg=true;
		dropBezierCurve();
		//throttledRenderEachCity();
	});
	function dropBezierCurve(){
		var option=myChart.getOption();
		data=[];
		for(var i=0;i<arr.length;i++){
			data.push(myChart.convertToPixel('geo',arr[i].coord));   //地理坐标转像素坐标
		}
		if(!option.graphic){
			option.graphic=[{}];
			option.graphic[0].elements=[];
		}
		if(falg){
			for(var j=0;j<option.graphic[0].elements.length;j++){
				if((option.graphic[0].elements[j].id==barLineID) || (option.graphic[0].elements[j].type=="circle" && option.graphic[0].elements[j].barLineID==barLineID)){
					option.graphic[0].elements.splice(j,1);
					j-=1;
				}
			}
		}
	    //线
		var polyline={
			type:"polyline",
			//$action:'merge',
			id:barLineID,
			$action:'replace',
			invisible:false,
			zlevel:0,
			z:0,
			shape:{
				points:data,
				smooth:0.5
			},
			 style:{
			 	lineWidth:bazOption.lineWidth ? bazOption.lineWidth:1,
	        	stroke:bazOption.lineColor? bazOption.lineColor : '#000',
	        	// stroke:new echarts.graphic.LinearGradient(   //线性渐变
          //           0, 0, 1, 0, [{
          //                   offset: 0,
          //                   color: '#000000'
          //               },
          //               {
          //                   offset: 1,
          //                   color: '#ff0033'
          //               }
          //           ]
          //       )
	        },
		};
		option.graphic[0].elements.push(polyline);
	    //点
	    for(var i=0;i<data.length;i++){
	  		var ss={
	  			type: 'circle',
		        //$action:'replace',
		        //$action:'merge',
		        barLineID:barLineID,
		        textDesc:arr[i].name,
		        position: data[i],
		        shape: {
		            cx: 0,
		            cy: 0,
		            r: bazOption.spotRadius ? bazOption.spotRadius:5,
		        },
		        style:{
		        	fill:bazOption.spotColor ? bazOption.spotColor:'#000',
		        },
		        invisible: false,
		        draggable: true,
		        ondrag: echarts.util.curry(onPointDragging, i),
		        onmousemove: echarts.util.curry(showTooltip, i),
		        onmouseout: echarts.util.curry(hideTooltip),
		        z: 999
	  		}
		  	option.graphic[0].elements.push(ss);
		}
		myChart.setOption(option);
		//console.log(myChart.getOption());

	}
	// function cc(){
	// 	console.log(this);
	// }

	function showTooltip(dataIndex) {
	    var option=myChart.getOption();
	    var textObj={
	    	type:'text',
	    	invisible:false,
	    	style:{
	    		text:this.textDesc,
	    		x:this.position[0],
	    		y:this.position[1]-20,
	    		fill:"#fff"
	    	}
	    };
	     option.graphic[0].elements.push(textObj);
	     myChart.setOption(option,true);
	}

	function hideTooltip() {
	   var option=myChart.getOption();
	   for(var i=0;i<option.graphic[0].elements.length;i++){
		  if(option.graphic[0].elements[i].type=="text"){
		  	option.graphic[0].elements.splice(i,1);
		  	i-=1;
		  }
	   }
	   myChart.setOption(option,true);
	}

	function onPointDragging(dataIndex) {
	    var option=myChart.getOption();
	    data[dataIndex]=this.position;
	   //线的位置改变
	   var elements=option.graphic[0].elements;
	   var circleArr=[];     //小圆点数组
	   for(var i=0;i<elements.length;i++){
	   		if(elements[i].type=="polyline" && elements[i].id==this.barLineID){
	   			 elements[i].shape.points=data;
	   		}
	   		if(elements[i].type=="circle" && elements[i].id==this.__ecGraphicId){    //点的位置改变
	   			elements[i].position=this.position;
	   		}
	   }
	   option.graphic.elements=elements;
	   arr[dataIndex].coord=myChart.convertFromPixel("geo",this.position);
	   myChart.setOption(option,true);
	}
}

//  //515贝塞尔曲线
// mapEcharts.prototype.dropBaz=function(arr){
//  	var myChart=this.chart;
//  	var option=myChart.getOption();
// 	var data=[];
// 	for(var i=0;i<arr.length;i++){
// 		data.push(myChart.convertToPixel('geo',arr[i].coord));   //地理坐标转像素坐标
// 	}
// 	console.log(data);
// 	var item={
// 		"type":"bezierCurve",
// 		"zlevel":100,
// 		"shape":{
// 			x1:data[0][0],
// 			y1:data[0][1],
// 			x2:data[5][0],
// 			y2:data[5][1],
// 			cpx1:data[1][0],
// 			cpy1:data[1][1],
// 			cpx2:data[2][0],
// 			cpy2:data[2][1],
// 			cpx3:data[3][0],
// 			cpy3:data[3][1],
// 			percent:1
// 		}
// 	};
// 	option.graphic[0].elements.push(item);
// 	myChart.setOption(option);
// }


// mapEcharts.prototype.setDropLinesBaz=function(lineName,linesData,lineOption){
// 	var linesArr=[];
// 	var markPointData=[];
// 	for(var i=0;i<linesData.length;i++){
// 		markPointData.push({
// 			"name":linesData[i].name,
// 			"coord":linesData[i].coordinate
// 		});
// 		if(i==linesData.length-1){
// 			break;
// 		}
// 		linesArr.push(
// 			{
// 				"coords":[linesData[i].coordinate,linesData[i+1].coordinate],
// 				"lineStyle":{
// 					"color": lineOption ? lineOption.color : "#fff",
// 					"width":lineOption ? lineOption.width : 1,
// 					"type":lineOption ? lineOption.type : "solid",
// 					"opacity":lineOption ? lineOption.opacity : 0.6,
// 					"curveness":0.5
// 				}
// 			}
// 		);
// 	}
// 	console.log(linesArr);
// 	var option=this.chart.getOption();
// 	var item={
//         name:lineName,
//         type: 'lines',
//         //polyline:true,
//         zlevel: 2,
//         symbolSize: 10,
//         data:linesArr,
//         markPoint:{
//         	symbol:'circle',
// 			symbolSize:5,
// 			data:markPointData
//         },
//         lineStyle:{
//         	curveness: 0.5
//         }

// 	};
// 	option.series.push(item);
// 	this.chart.setOption(option);
// 	return item;                    //返回绘制的线对象
// }

mapEcharts.prototype.zoomAnimation=function(){
	var myChart=this.chart;
	var count = null;
	var index=0;
    var zoom = function(per){
        if(!count) count = per;
        count = count + per;
        myChart.setOption({
            geo: {
                zoom: count
            }
        });
        if(count < 1){ 
        	index++;
        	window.requestAnimationFrame(function(){
            	zoom(0.2);
        	});
        }
        
    };
    window.requestAnimationFrame(function(){
        zoom(0.2);
    });

}


mapEcharts.prototype.setBaz=function(){
	arr=[
			{name:"长春",coord:[125.8154,44.2584]},
			{name:"呼和浩特",coord:[111.4124,40.4901]},
			{name:"乌鲁木齐",coord:[87.9236,43.5883]},
			{name:"成都",coord:[103.9526,30.7617]},
	];
	var data=[];
	for(var i=0;i<arr.length;i++){
		data.push(this.chart.convertToPixel('geo',arr[i].coord));   //地理坐标转像素坐标
	}
	var arr2=[
			{name:"贵阳",coord:[106.6992,26.7682]},
			{name:"长沙",coord:[113.0823,28.2568]},
			{name:"韶关",coord:[113.7964,24.7028]}
	];
	var data2=[];
	for(var i=0;i<arr2.length;i++){
		data2.push(this.chart.convertToPixel('geo',arr2[i].coord));   //地理坐标转像素坐标
	}
	var option=this.chart.getOption();

	option.series.push(
		{
			type: 'custom',
			coordinateSystem:"geo",
	        renderItem: function (params, api) {
	            // console.log(params);
	            // var categoryIndex = api.value(0);
	            // var start = api.coord([api.value(1), categoryIndex]);
	            // var end = api.coord([api.value(2), categoryIndex]);
	            // var height = api.size([0, 1])[1] * 0.6;


	            return {
	            	type: 'group',
	            	diffChildrenByName:true,
	           		children: [
	           			{
	           				type:"polyline",
			           		id:'sheshun',
			           		invisible:false,
			           		zlevel:0,
						 	z:100,
						 	shape:{
						 		points:data,
						 		smooth:0.5
						 	},
						 	style:{
						 		fill:null,
						 		lineWidth:2,
						 		stroke:"#ff0033"
						 	}
	           			},
	           			{
	           				type: 'circle',
					        position: data[0],
					        shape: {
					            cx: 0,
					            cy: 0,
					            r: 15
					        },
					        style:{
					        	fill:'#ccff33'
					        },
					        invisible: false,
	           			},
	           			{
	           				type:"line",
			           		id:'sheshun',
			           		invisible:false,
			           		zlevel:0,
						 	z:100,
						 	shape:{
						 		x1:data2[0][0],
						 		y1:data2[0][1],
						 		x2:data2[1][0],
						 		y2:data2[1][1],
						 	},
						 	style:{
						 		//fill:'',
						 		lineWidth:2,
						 		stroke:"#ff0033"
						 	}
	           			},
	           		],
	           		
	            };
	        },
	        data:arr,
	        animation:true,
	        animationDelay:500,
	        animationDuration:10000,
	        animationDurationUpdate:10000
		}
	);
	this.chart.setOption(option,true);
 }




