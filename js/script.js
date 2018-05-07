// 此对象依赖于echerts.js,地图GeoJson
function mapEcharts(ele,echarts){
	this.ele=ele;
	this.echarts=echarts;
	this.chart;
}

mapEcharts.prototype.DropMapGeo=function(mapName,geoJsonData,option,callback){
	var ele=this.ele;
	var echarts=this.echarts;
	var regionName=mapName;
	var chart=this.chart;
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

	};
	chart.setOption(options);
	this.chart=chart;
	chart.on('click',function(params){
		if(callback){
			//chart.dispose();
			chart.showLoading();
			callback(params);
		}
	});
	// chart.dispatchAction({
	// 	type: 'geoSelect',          //选中指定的地图区域。
	//     type: 'geoUnSelect',        //取消选中指定的地图区域。
	//     type: 'geoToggleSelect',    //切换指定的地图区域选中状态。
	// });

	// chart.dispatchAction({
	//     type: 'mapSelect',          //选中指定的地图区域。
	//     type: 'mapUnSelect',        //取消选中指定的地图区域。
	//     type: 'mapToggleSelect',    //切换指定的地图区域选中状态。
	//     seriesIndex: 1,  // 可选，系列 index，可以是一个数组指定多个系列
	//     seriesName: 1,   // 可选，系列名称，可以是一个数组指定多个系列
	//     dataIndex: 1,          // 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
	//     //name: string                 // 可选，数据名称，在有 dataIndex 的时候忽略
	// });

	// chart.on('geoselectchanged',function(params){
	// 	console.log(params);
	// });
	// chart.on('mapselectchanged',function(params){
	// 	console.log(params);
	// });
	// chart.on('dblclick',function(params){
	// 	console.log(params);
	// });
	
}

//设置地图块的颜色
mapEcharts.prototype.setMapColor=function(params,color){
	var option=this.chart.getOption();
	console.log(params);
	console.log(color);
	for(var i=0; i<option.series.length;i++){
		if(option.series[i].type==params.seriesType && params.seriesType=="map" && option.series[i].name==params.seriesName){
			option.series[i].data[params.dataIndex].itemStyle.color="#"+color;
		}
	}
	console.log(option);
	this.chart.setOption(option);
}

//地图上绘制线条
//linesArr连接线段之间的点，如[[103.88,30.82],[104.05,30.70],[104.10,30.67],[104.43,30.85]]
//isShowSpot:是否显示线段之间的点，默认显示
//lineOption:线条的参数
mapEcharts.prototype.setDropLines=function(lineName,linesData,lineOption){
	var linesArr=[];
	var markPointData=[]; 
	var trajectoryLine=[];   //轨迹线数组对象用于返回参数
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
		trajectoryLine.push({
			seriesName:lineName,
			seriesType:"lines",
			data:linesArr[i],
			dataIndex:i
		});
	}
	var option=this.chart.getOption();
	option.series.push(
		{
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
    	}
    );
	this.chart.setOption(option);
	return trajectoryLine; 
}

//为线条设置动画
//trajectoryLine：运动轨迹线
//lineAnimationOption:动画参数
//isStartUp:是否启用动画，true开启动画，false关闭动画
mapEcharts.prototype.setLineAnimation=function(trajectoryLine,lineAnimationOption,isStartUp){
	var option=this.chart.getOption();
	var coordsArr=[];
	for(var i=0;i<trajectoryLine.length;i++){
		coordsArr.push(trajectoryLine[i].data.coords[0]);
		if(i==trajectoryLine.length-1){
			coordsArr.push(trajectoryLine[i].data.coords[1]);
		}
	}
	option.series.push(	
		{
	        name: trajectoryLine.seriesName + 'Animation',
	        type: 'lines',
	        polyline:true,
	        zlevel: 1,
	        effect: {
	            show: isStartUp,
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
	);
	this.chart.setOption(option);
}

//设置线的颜色
mapEcharts.prototype.setLineColor=function(line,lineStyle){
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
					"borderColor":spotOption? spotOption.borderColor : '#ddd',
					"borderWidth":spotOption? spotOption.borderWidth : 1,
					"borderType":spotOption? spotOption.borderType : "solid",
					"opacity":spotOption? spotOption.opacity : 1
				},
				"symbol":spotOption? spotOption.symbol : 'circle',
				"symbolSize":spotOption? spotOption.symbolSize : 10,
				"symbolOffset":spotOption? spotOption.symbolOffset : [0,0],
				"label":{
					"show":true,
					"color":"#000",
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
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==params.seriesName && params.seriesType=="scatter"){ 
			option.series[i].data[params.dataIndex].name=text;
			if(textOption.color){
				option.series[i].data[params.dataIndex].label.color=textOption.color;
			}
			if(textOption.fontSize){
				option.series[i].data[params.dataIndex].label.fontSize=textOption.fontSize;
			}
			if(textOption.offset){
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
		if(option.series[i].name==params.seriesName && params.seriesType=="scatter"){
			option.series[i].data.splice(params.dataIndex,1);
			break;
		}
	}
	this.chart.setOption(option);
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
     	}else{
     		param=params;
     	}
        callback(param);
     });
}
