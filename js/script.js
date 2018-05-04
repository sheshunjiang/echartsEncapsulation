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
		       		areaColor: '#dddddd',
		       		borderColor: '#111'
		       	},
		       	emphasis: {
		       		areaColor: '#f2eca6'
		       	}
		    }
		},
		series:[
			{
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
		]

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
}

//地图上绘制线条
//linesArr连接线段之间的点，如[[103.88,30.82],[104.05,30.70],[104.10,30.67],[104.43,30.85]]
//isShowSpot:是否显示线段之间的点，默认显示
//lineOption:线条的参数
mapEcharts.prototype.setDropLines=function(lineName,linesData,lineOption){
	var linesArr=[];
	var markPointData=[];
	var trajectoryLine=[];  //轨迹线用于返回参数
	for(var i=0;i<linesData.length;i++){
		markPointData.push({
			"name":linesData[i].name,
			"coord":linesData[i].coordinate
		});
		trajectoryLine.push(linesData[i].coordinate);
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
	//console.log(linesArr);
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
	console.log(trajectoryLine);
	option.series.push(	
		{
	        //name: item[0] + ' Top10',
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
	                //color: color[i],
	                width: 0,
	                opacity:0.6
	            }
	        },
	        data: [
	        	{coords:trajectoryLine}
	        ]
	    }
	);
	this.chart.setOption(option);
	console.log(this.chart.getOption());
}

//设置线的颜色
mapEcharts.prototype.setLineColor=function(params){
	var option=this.chart.getOption();
	for(var i=0;i<option.series.length;i++){
		if(option.series[i].name==params.seriesName){ 
			option.series[i].data[params.dataIndex].lineStyle.color="#a6c84c";
			break;
		}
	}
	this.chart.setOption(option);
	//console.log(option);
}

//地图上绘制点
//spotOption={}
mapEcharts.prototype.setDropSpot=function(spotsName,spotData,marker){
	var option=this.chart.getOption();
	var seriesData=[];
	for(var i=0;i<spotData.length;i++){
		seriesData.push(
		{
			"name":spotData[i].text,
			"value":spotData[i].coordinate
		}
		);
	}
	option.series.push(
		{
			name: spotsName,
            type: 'scatter',
            coordinateSystem: 'geo',
            data: seriesData,
			symbol:"circle",
            symbolSize: 12,
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                emphasis: {
                    borderColor: '#fff',
                    borderWidth: 1
                }
            }
		}
	);
	this.chart.setOption(option);
}

//监听事件
mapEcharts.prototype.linster=function(eventName,callback){
     this.chart.on(eventName,function(params){
        callback(params);
     });
}
