!function ($) {

    /* PrettyCode CLASS DEFINITION
     * ========================= */
    var PrettyCode = function (element, codeUrl) {
        this.$element = $(element);
        this.codeUrl = codeUrl;
        this.title = this.$element.text();

        this.$codePanel = $('<div class="modal fade" aria-labelledby="myModalLabel" aria-hidden="true">' +
                '<div class="modal-dialog"><div class="modal-content"><div class="modal-header">' +
				'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<h4 class="modal-title text-center" id="myModalLabel">' + this.title + '</h4></div>' +
                '<div class="modal-body"><pre class="prettyprint linenums">' +
                '<span class="loading">源代码加载中...</span></pre></div></div></div></div>');
        this.$codeContainer = this.$codePanel.find('pre.prettyprint');
        this.$element.after(this.$codePanel);
    };

    PrettyCode.prototype = {
        constructor : PrettyCode,
        htmlEncode : function (s) {
            return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },
        show : function () {
			var noContent = this.$codeContainer.children().hasClass('loading');
			if (noContent) {
				var that = this;
				$.ajax({
					url : this.codeUrl,
					dataType : 'text',
					success : function (data) {
						var encodedData = that.htmlEncode(data);

						that.$codeContainer.html(encodedData);
						window.prettyPrint && prettyPrint();
					},
					error : function (XMLHttpRequest, textStatus, errorThrown) {
						alert(errorThrown);
					},
					cache : true,
					type : 'get',
					async : true
				});
			}
			
			this.$codePanel.modal('show');
        }
    };

    /* PrettyCode PLUGIN DEFINITION
     * ============================= */
    $.fn.prettyCode = function (option) {
        return this.each(function () {
            var $this = $(this),
            data = $this.data('prettyCode'),
            codeUrl = typeof option == "string" && option;

            if (!data)
                $this.data('prettyCode', data = new PrettyCode(this, codeUrl));

            data.show();
        });
    };

    /* PrettyCode DATA-API
     * =================== */
    $(document).on('click.prettyCode.data-api', '[data-code-url]', function () {
        var $this = $(this),
        codeUrl = $this.attr('data-code-url');

        $this.prettyCode(codeUrl);
    });

    /* PrettyCode Extend-PLUGIN
     * =================== */
    $.initPrettyCodeSwitch = function () {
        $(document).find('[data-code-url]').not('.btn')
			.addClass('btn btn-danger')
			.append(' <i class="glyphicon glyphicon-new-window"></i>');
    }

}(window.jQuery);

