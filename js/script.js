// 此对象依赖于echerts.js,地图GeoJson
function mapEcharts(ele){
	this.ele=ele;
	//this.echarts=echarts;
}

mapEcharts.prototype.DropMapGeo=function(mapName,geoJsonData,option,callback){
	var ele=this.ele;
	//var echarts=this.echarts;
	var regionName=mapName;
	echarts.registerMap(regionName,geoJsonData);
	var chart=echarts.init(ele);
	var options;
	options={
		backgroundColor: option.backgroundColor? option.backgroundColor:"#ffffff",
		visualMap: {
			show:false,
			min: 0,
			max: 200,
			calculable: true,
			inRange: {
				color: option.visualMapColor?option.visualMapColor:['#50a3ba', '#eac736', '#d94e5d']
			},
			textStyle: {
				color: '#fff'
			}
		},
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
	chart.on('click',function(params){
		if(callback){
			chart.dispose();
			callback(params);
		}
	});
}

