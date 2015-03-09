!function ($) {

    /* Location CLASS DEFINITION
     * ========================= */
    var Location = function (options) {
		this.$Summary = $('#' + options.summaryId);
        this.$NavMenu = $('#' + options.navMenuId);
        this.$SubMenu = $('#' + options.subMenuId);
        this.$Breadcrumb = $('#' + options.breadcrumbId);
        this.$Content = $('#' + options.contentId);

        this.$Location = this.getLocationFromSiteMap(options.siteMapPath);

        this.onContentLoad = options.onContentLoad;
        this.onContentLoading = options.onContentLoading;
        this.onContentUpdate = options.onContentUpdate;

        this.transform = {
            blackBoard: {
                tag: "div", "class": "blackBoard",
                children: [
                    {
                        tag: "h3", html: "${title} <small>${sub_title}</small>"
                    },

                    {
                        tag: "ul",
                        children: function (obj, index) {
                            return json2html.transform(obj.chapters, {
                                tag: "li",
                                children: [
                                    { tag: "label", html: "${caption}" },
                                    { tag: "p", html: "${content}" }
                                ]
                            })
                        }
                    }
                ]
            },

            alert: {
                tag: "div", "class": "alert", html: "<h4>${title}</h4>",
                children: function () {
                    return json2html.transform(this.pargraphs, { tag: "p", html: "${description}" });
                }
            }
        };
    };

    Location.prototype = {
        constructor : Location,
        getLocationFromSiteMap : function (siteMapPath) {
            var $siteMap;

            $.ajax({
                url : siteMapPath,
                dataType : 'xml',
                success : function (xml) {
                    $siteMap = $('location', xml);
                },
                error : function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(errorThrown);
                },
                cache : true,
                type : 'GET',
                async : false
            });

            return $siteMap;
        },
        get$Nav : function (navText) {
            return this.$Location.find('nav[text="' + navText + '"]');
        },
        get$Category : function (categoryText) {
            return this.$Location.find('category[text="' + categoryText + '"]');
        },
        get$Item : function (anchor) {
            var $Item = this.$Location.find('item[name="' + anchor + '"]');

            // 如果指定的 anchor 不存在，就使用默认的（第一个anchor）
            if ($Item.length == 0) {
                $Item = this.$Location.find('item[name]').first();
            }

            return $Item;
        },
        loadTitle : function ($Item) {
            var title = $Item.text();

            $('title').text(title);
        },
        loadKeywords : function ($Item) {
            var keywords = $Item.attr('keywords');

            $('meta[name="keywords"]').attr('content', keywords);
        },
		loadSummary : function ($Nav){
			var summaryTitle = $Nav.attr('text'),
			summaryContent = $Nav.attr('summary');

			this.$Summary.html('<h1>' + summaryTitle + '</h1><p>' + summaryContent + '</p>');
		},
        loadNav : function () {
            var that = this;

            that.$NavMenu.empty();
            this.$Location.find('nav[text]:has(item[name])').each(function () {
                var $Nav = $(this),
                $NavLink = that.createNavLink($Nav);

                that.$NavMenu.append($NavLink);
            });
        },
        loadSubMenu : function (navText) {
            var that = this;

            that.$SubMenu.empty();
            this.get$Nav(navText).find('category[text]').each(function () {
                var $Category = $(this),
                $CategoryLink = that.createCategoryLink($Category),
                $CategoryChild = $('<ul class="nav"></ul>');

                $Category.find('item[name]').each(function () {
                    var $Item = $(this),
                    $ItemLink = that.createItemLink($Item);

                    $CategoryChild.append($ItemLink);
                });

                that.$SubMenu.append($CategoryLink.append($CategoryChild));
            });
        },
        loadBreadcrumb : function ($Item) {
            var $Category = $Item.parent().first(),
            $Nav = $Category.parent().first();

            var $ItemText = $('<li class="active">' + $Item.text() + '</li>'),
            $CategoryLink = this.createCategoryLink($Category),
            $NavLink = this.createNavLink($Nav)

                this.$Breadcrumb.empty();
            this.$Breadcrumb.append($NavLink).append($CategoryLink).append($ItemText);
        },
        loadContent : function ($Item) {
            var url = $Item.attr('url'),
            fileType = url.split('.')[1],
            that = this;

            if (!url || url == '#') {
                that.$Content.html('<p>页面正在开发中，敬请期待。。。</p>');
                return;
            }

            that.onContentLoading();

            $.ajax({
                url : url,
                dataType : fileType,
                success : function (data, textStatus, jqXHR) {
                    if(fileType == 'json') {
                        var blackBoardHtml=json2html.transform(data.blackBoard, that.transform.blackBoard),
                            alertHtml=json2html.transform(data.alert, that.transform.alert);

                        that.$Content.html(blackBoardHtml + alertHtml);
                    } else {
                        that.$Content.html(data);
                    }
 
                    that.onContentUpdate();
                },
                complete : function (XMLHttpRequest, textStatus) {
                    that.onContentLoad();
                },
                error : function (XMLHttpRequest, textStatus, errorThrown) {alert(errorThrown);
                    that.$Content.html('服务器连接不上');
                },
                cache : true,
                type : 'get',
                async : true
            });
        },
        loadPage : function (anchor) {
            var $Item = this.get$Item(anchor),
            $Category = $Item.parent().first(),
            $Nav = $Category.parent().first(),
            navText = $Nav.attr('text');

            // 从 SiteMap 中找到 anchor, 纠正错误（如果指定的anchor不存在）
            anchor = $Item.attr('name');
            window.location.hash = anchor;

            // 加载 anchor 对应的 Nav, SubMenu, Breadcrumb, Content
            this.loadTitle($Item);
            this.loadKeywords($Item);
			this.loadSummary($Nav);
            this.loadNav();
            this.loadSubMenu(navText);
            this.loadBreadcrumb($Item);
            this.loadContent($Item);

            var $NavLink = this.$NavMenu.find('li:contains("' + $Nav.attr('text') + '")'),
            $ItemLink = this.$SubMenu.find('li:has(a[href="' + anchor + '"])');

            // 给 Nav 和 Item, 增加 "active" 样式
            this.activeLink($NavLink);
            this.activeLink($ItemLink);
        },
        createLinkHtml : function (anchor, text) {
            return '<li><a data-target="location" href="' + (anchor || '#') + '">' + text + '</a></li>';
        },
        createLink : function (anchor, text) {
            var that = this;

            return $(this.createLinkHtml(anchor, text));
        },
        createNavLink : function ($Nav) {
            var anchor = $Nav.find('item[name]').first().attr('name'),
            navText = $Nav.attr('text');

            return this.createLink(anchor, navText)
        },
        createCategoryLink : function ($Category) {
            var anchor = $Category.find('item[name]').first().attr('name'),
            categoryText = $Category.attr('text');

            return this.createLink(anchor, categoryText);
        },
        createCategoryText : function ($Category) {
            var categoryText = $Category.attr('text');

            return $('<li class="nav-header">' + categoryText + '</li>');
        },
        createItemLink : function ($Item) {
            var anchor = $Item.attr('name'),
            itemText = $Item.text();

            return this.createLink(anchor, itemText);
        },
        activeLink : function ($Link) {
            $Link.addClass('active').siblings().removeClass('active');
        }

    };

    /* Location PLUGIN DEFINITION
     * ============================= */
    $.fn.location = function (option) {
        return this.each(function () {
            var $this = $(this),
            options = $.extend({}, $.fn.location.defaults, typeof option == 'object' && option),
            data = $this.data('location');

            if (!data)
                $this.data('location', data = new Location(options));

            // 响应地址栏
            var anchor = window.location.hash || options.defaultAnchor;
            anchor = '#' + anchor.split( '#' )[1];
            data.loadPage(anchor);

            // 响应页面链接
            $(document).on('click', 'a[data-target=location][href^=#]', function () {
                var $this = $(this),
                href = $this.attr('href');

                data.loadPage(href);
            });
        });
    };

    $.fn.location.defaults = {
		summaryId : 'summary',
        navMenuId : 'mainMenu',
        subMenuId : 'subMenu',
        breadcrumbId : 'breadcrumb',
        contentId : 'content',
        siteMapPath : 'content/siteMap.xml',
        defaultAnchor : '#about',
        onContentLoading : function () {},
        onContentLoad : function () {},
        onContentUpdate : function () {}
    };

    /* Location DATA-API
     * =================== */
    $(window).on('load', function () {
        $('body').location({

            /* 内容加载前执行 */
            onContentLoading : function () {

                $.waitingPrompt.show('#content', '正在加载，请稍等 ...'); // 打开等待提示（最先执行）
            }

            /* 内容加载完成后执行 */
        ,
            onContentLoad : function () {

                $.waitingPrompt.hide('#content'); // 关闭等待提示（最后执行）
            }

            /* 内容更新后执行 */
        ,
            onContentUpdate : function () {

                $.initPrettyCodeSwitch(); // 初始化 PrettyCode 的开关样式
                $('.alert').addClass('alert-info'); // 初始化 Alert区域 的样式
            }

        });
    });

}(window.jQuery);

