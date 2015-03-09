!function () {

    /* PackageSwitch 核心类定义
    * ========================= */
    var PackageSwitch = function ( $element, options ) {

        // 多个键值对组成的 { 对象 } 
        // { 'id1':'attr1', 'id2':'attr2' }
        this.packageSelector = options.packageSelector;

        // 多个系列组成的 [ 数组 ] 
        // [ { 'seriesName': '系列1', 'seriesValues': { 'id1': 'attr1_值1', 'id2': 'attr2_值1' } }
        // , { 'seriesName': '系列2', 'seriesValues': { 'id1': 'attr1_值2', 'id2': 'attr2_值2' } } ]
        this.seriesCollection = options.seriesCollection;

        // 将当前的值作为一个系列，加入选择集合
        if ( options.addDefault ) {
            var defaultSeries = { 'seriesName': options.defaultSeriesName, 'seriesValues': this.getDefaultSeriesValues() };
            this.seriesCollection.unshift( defaultSeries );
        }

        // 展示可切换系列的列表 
        // [ 系列1名称, 系列2名称 ]
        var seriesList = this.getSeriesList( this.seriesCollection );
        options.showSeriesList( $element, seriesList, this );
    };

    PackageSwitch.prototype = {
        constructor: PackageSwitch

      , switchTo: function ( index ) {
          var series = this.seriesCollection[index]
            , seriesName = series['seriesName']
            , seriesValues = series['seriesValues'];

          $.each( this.packageSelector, function ( id, attr ) {
              $( '#' + id ).attr( attr, seriesValues[id] );
          } );

          //alert( seriesName );
      }

      , getDefaultSeriesValues: function () {
          var defaultSeriesValues = {};

          $.each( this.packageSelector, function ( id, attr ) {
              defaultSeriesValues[id] = $( '#' + id ).attr( attr );
          } );

          return defaultSeriesValues;
      }

      , getSeriesList: function ( seriesCollection ) {
          var seriesList = [];

          $.each( seriesCollection, function ( index, series ) {
              seriesList[index] = series['seriesName'];
          } );

          return seriesList;
      }
    };


    /* PackageSwitch 插件定义
    * ============================= */
    $.fn.packageSwitch = function ( option ) {
        return this.each( function () {
            var $this = $( this )
              , options = $.extend( {}, $.fn.packageSwitch.defaults, typeof option == 'object' && option )
              , data = $this.data( 'packageSwitch' );

            if ( !data ) $this.data( 'packageSwitch', data = new PackageSwitch( $this, options ) );
            if ( typeof option == 'number' ) data.switchTo( option );
        } );
    };

    $.fn.packageSwitch.defaults = {
        addDefault: true,
        defaultSeriesName: '默认',
        showSeriesList: function ( $element, seriesList, packageSwitch ) { }     // 显示可切换系列的列表[系列名称，序号]
    };


}( window.jQuery );