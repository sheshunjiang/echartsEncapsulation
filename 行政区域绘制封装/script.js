//使用geo绘制地图
function DropMapGeo(ele,mapName,geoJsonData,option){
	var regionName=mapName;
	echarts.registerMap(regionName,geoJsonData);
	var chart=echarts.init(ele);
	var options;
	if(option){
		options=option;
	}else{
		options={
			backgroundColor: '#ffffff',
			visualMap: {
				show:false,
				min: 0,
				max: 200,
				calculable: true,
				inRange: {
					color: ['#50a3ba', '#eac736', '#d94e5d']
				},
				textStyle: {
					color: '#fff'
				}
			},
			geo: {
				map: regionName,
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
			}

		};
	}
	chart.setOption(options);
}

//type:map绘制地图（可以改变地图背景颜色）
function DropMap(ele,mapName,geoJsonData,colorArr,option){
	var regionName=mapName;
	echarts.registerMap(regionName,geoJsonData);
	var chart=echarts.init(ele);
	var options;
	if(option){
		options=option;
	}else{
		options={
			visualMap: {
				show:false,
				min: 0,
				max: 200,
				calculable: true,
				inRange: {
					color: ['#50a3ba', '#eac736', '#d94e5d']
				},
				textStyle: {
					color: '#fff'
				}
			},
			roam:true,
	        series:[
	            {
	                name : "rinima",
	                type : "map",
	                map : regionName,
	                zoom:1,
	                selectedMode : 'single',
	                label:{
	                        normal:{
	                            show:true,
	                            color:'#eeeeee'
	                        }
	                    },
	                data:colorArr
	                
	            }
	        ]
		};
	}
	chart.setOption(options);
}


//地图上绘制散列图(scatter)
//ele:DOM元素
//mapName:地图名称(如：china)
//geoJsonData:绘制地图的地图数据
// option：  参数
// {
// 	backgroundColor:'#dddddd',   //地图背景
// 	title:"",       //地图标题
// 	legendData:"",  
// 	visualMapMin:0,
// 	visualMapMax:50,
// 	visualMapColor: ['#50a3ba', '#eac736', '#d94e5d'],   //颜色取值
//  symbol:'rect',                                         //设置标记的样式，其值可以为'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'，也可以为图片，通过'image://url' 设置为图片；也可以通过 'path://' 将图标设置为任意的矢量路径
// 	seriesData:convertData(seriesData)      //数据

// };
function DropMapScatter(ele,mapName,geoJsonData,option,callback){
	var regionName=mapName;
	echarts.registerMap(regionName,geoJsonData);
	var chart=echarts.init(ele);
	var options;
	options = {
	    backgroundColor: option.backgroundColor? option.backgroundColor:'#404a59',
	    title: {
	        text: option.title,
	        left:'center',
	        textStyle: {
	            color: '#fff'
	        }
	    },
	    tooltip: {
	        trigger: 'item',
	        formatter: function (params) {
	            return params.name + ' : ' + params.value[2];
	        }
	    },
	    legend: {
	        orient: 'vertical',
	        y: 'bottom',
	        x:'right',
	        data:option.legendData,
	        textStyle: {
	            color: '#fff'
	        }
	    },
	    visualMap: {
	        min: option.visualMapMin? option.visualMapMin:0,
	        max: option.visualMapMax? option.visualMapMax:200,
	        calculable: true,
	        inRange: {
	            color: option.visualMapColor? option.visualMapColor:['#50a3ba', '#eac736', '#d94e5d']
	        },
	        textStyle: {
	            color: '#fff'
	        }
	    },
	    geo: {
	    	map: regionName,
	        roam:true,   //可以缩放地图
			label: {
			  	show:true
			},
			itemStyle: {
				map: regionName,
			 	normal: {
			       	areaColor: '#dddddd',
			       	borderColor: '#111'
			    },
			    emphasis: {
			    	areaColor: '#f2eca6'
			    }
			}
	    },
	    series: [
	        {
	            type: 'scatter',
	            coordinateSystem: 'geo',
	            data: option.seriesData,
	            symbol:option.symbol? option.symbol : 'circle',
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
	    ]
	}	
	chart.setOption(options);
	//是否有点击事件回调函数
	if(callback){
		chart.on('click',callback);
	}
}

//绘制涟漪效果的散列图
//ele:DOM元素
//mapName:地图名称(如：china)
//geoJsonData:绘制地图的地图数据
//参数
// option:{
// 	backgroundColor:'#dddddd',   //地图背景
// 	title:"绘制散列图涟漪效果",       //地图标题
// 	legendData:"",  
// 	visualMapMin:0,
// 	visualMapMax:50,
// 	visualMapColor: ['#50a3ba', '#eac736', '#d94e5d'],   //颜色取值
// 	symbol:'',                                         //设置标记的样式，其值可以为'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'，也可以为图片，通过'image://url' 设置为图片；也可以通过 'path://' 将图标设置为任意的矢量路径
// 	symbolSize:function (val){return val[2]/10;}, //标记的大小，可以是固定大小的数字如10.也可以是函数动态设置标记大小,也可以用数组分开表示宽和高，例如 [20, 10]
// 	seriesData:      //数据
// };
//callback:点击事件回调函数回调函数
function DropMapEffectScatter(ele,mapName,geoJsonData,option,callback){
	var regionName=mapName;
	echarts.registerMap(regionName,geoJsonData);
	var chart=echarts.init(ele);
	var options;
	options = {
	    backgroundColor: option.backgroundColor? option.backgroundColor:'#404a59',
	    title: {
	        text: option.title,
	        x:'center',
	        textStyle: {
	            color: '#fff'
	        }
	    },
	    tooltip: {
	        trigger: 'item',
	        formatter: function (params) {
	            return params.name + ' : ' + params.value[2];
	        }
	    },
	    legend: {
	        orient: 'vertical',
	        y: 'bottom',
	        x:'right',
	        data:option.legendData,
	        textStyle: {
	            color: '#fff'
	        }
	    },
	    visualMap: {
	        min: option.visualMapMin? option.visualMapMin:0,
	        max: option.visualMapMax? option.visualMapMax:200,
	        calculable: true,
	        inRange: {
	            color: option.visualMapColor? option.visualMapColor:['#50a3ba', '#eac736', '#d94e5d']
	        },
	        textStyle: {
	            color: '#fff'
	        }
	    },
	    geo: {
	    	map: regionName,
	        roam:true,   //可以缩放地图
			label: {
			  	show:true
			},
			itemStyle: {
				map: regionName,
			 	normal: {
			       	areaColor: '#dddddd',
			       	borderColor: '#111'
			    },
			    emphasis: {
			    	areaColor: '#f2eca6'
			    }
			}
	    },
	    series: [
	       {
	            type: 'effectScatter',
	            coordinateSystem: 'geo',
	            data: option.seriesData,
	            symbol:option.symbol,
	            symbolSize: option.symbolSize,
	            showEffectOn: 'render',
	            rippleEffect: {
	                brushType: 'stroke'
	            },
	            hoverAnimation: true,
	            label: {
	                normal: {
	                    formatter: '{b}',
	                    position: 'right',
	                    show: true
	                }
	            },
	            itemStyle: {
	                normal: {
	                    color: '#f4e925',
	                    shadowBlur: 10,
	                    shadowColor: '#333'
	                }
	            },
	            zlevel: 1
	        }

	    ]
	}	
	chart.setOption(options);
	if(callback){
		chart.on('click',callback);
	}
}


