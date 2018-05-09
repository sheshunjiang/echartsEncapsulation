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
		geo: {
			map: regionName,
			center:option.center,
		    roam:true,   //可以缩放地图
		    //selectedMode:'single',
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
		    }
		},
		series:[
			{
				name:regionName,
                type : "map",
                geoIndex:0,
                coordinateSystem:'geo',
                map : regionName,
                zoom:1.1,
                roam : true,
                label:{
                        normal:{
                            show:true
                        }
                    },
                coordinateSystem:'geo',
                data : option.seriesData

            }
		],
		animation:true
		//animationThreshold:20000

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
//color:颜色
mapEcharts.prototype.setMapColor=function(params,color){
	var option=this.chart.getOption();
	for(var i=0; i<option.series.length;i++){
		if(option.series[i].type==params.seriesType && params.seriesType=="map" && option.series[i].name==params.seriesName){
			option.series[i].data[params.dataIndex].itemStyle.color=color;
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
        zlevel: Math.round(Math.random()*100),
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
	//console.log(option);
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
mapEcharts.prototype.setSpotText=function(params,text,textOption){
	var option=this.chart.getOption();
	console.log(textOption);
	console.log(params);
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==params.seriesName && params.seriesType=="scatter"){ 
			if(text){
				option.series[i].data[params.dataIndex].name=text;
			}
			if(textOption.color && textOption.color!=""){
				option.series[i].data[params.dataIndex].label.color=textOption.color;
			}
			if(textOption.fontSize){
				option.series[i].data[params.dataIndex].label.fontSize=textOption.fontSize;
			}
			if(textOption.offset && textOption.offset.length==2){
				option.series[i].data[params.dataIndex].label.offset=textOption.offset;
			}
			break;
		}
	}
	this.chart.setOption(option);
	console.log(this.chart.getOption());
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
	console.log(params);
	var option=this.chart.getOption();
	 console.log(option);
	var count=0;
	for(var i=0;i<option.series.length;i++){
		for(var j=0;j<params.length;j++){
			if(option.series[i].name==params[j].seriesName && params[j].seriesType=="scatter"){
				//console.log(option.series[i].data.indexOf(params[j].data));
				for(var k=0;k<option.series[i].data.length;k++){
					if(option.series[i].data[k].name==params[j].data.name && option.series[i].data[k].value==params[j].data.value){
						option.series[i].data[k].splice(k,1);
					}
				}
				//option.series[i].data.splice(params.dataIndex,1);
				break;
			}
		}
	}
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].data.length==0){
			option.series.splice(i,1);
		}
	}
	this.chart.setOption(option,true);
	console.log(option);
}

//监听事件
mapEcharts.prototype.linster=function(eventName,callback){
     // console.log(this.chart);
     this.chart.on(eventName,function(params){
     	// if(eventName=="click"){
     	// 	console.log(params);
     	// }
     	var param={};
     	if(params.seriesType=="scatter"){
     		param.data=params.data;
     		param.seriesName=params.seriesName;
     		param.seriesType="scatter";
     		param.dataIndex=params.dataIndex;
     	}else if(params.seriesType=="lines"){
     		param.data=params.data;
     		param.seriesName=params.seriesName;
     		param.seriesType="lines";
     		param.dataIndex=params.dataIndex;
     	}
     	else{
     		param=params;
     	}
        callback(param);
     });
}
