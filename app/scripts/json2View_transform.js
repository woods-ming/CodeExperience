!function ( $ ) {

    /* json2View PLUGIN DEFINITION
    * ============================= */
    var transform_blackBoard_sections = [
        {
            tag: "li", children: [
                {
                    tag: "dl", children: function (section, index) {
                        return json2html.transform(section, { tag: "dt", id: "${section_name}", html: "${section_name}" })
                            + json2html.transform(section.blocks,
                            {
                                tag: "dd", children: [
                                    { tag: "label", class: "label label-primary", html: "${key}" },
                                    { tag: "span", html: " ${description}" }
                                ]
                            });
                    }
                }
            ]
        }
    ];

    var transform_blackBoard = {
        tag: "div", "class": "blackBoard",
        children: [
             {
                 tag: "h3", html: "${title}", children: [{ tag: "small", html: "${sub_title}" }]
             },

             {
                 tag: "ul", children: function () {
                    if( !this.chapters ){
                        return json2html.transform(this.sections, transform_blackBoard_sections);
                    }

                    return json2html.transform(this.chapters,
                        {
                            tag: "li", children: function (chapter, index) {
                                return json2html.transform(chapter, { tag: "label", html: "${chapter_name}" })
                                    + json2html.transform(chapter.sections, 
                                        { tag: "ul", children: transform_blackBoard_sections});
                            }
                        });
                 }
             }
        ]
    };

    var transform_catalog_sections = { 
        tag:"li", 
        children:[{ 
            tag: "a", href:"#${section_name}", html:"${section_name}" 
        }]
    };

    var transform_catalog = {
        tag:"li",
        children:[
            { 
                tag: "a", html: "${chapter_name}" 
            },
            { 
                tag: "ul", "class": "nav", children: function (chapter, index) {
                    return json2html.transform(chapter.sections, transform_catalog_sections);
                } 
            }
        ]
    };

    var transform_alert = {
        tag: "div", "class": "alert", html: "<h4>${title}</h4>",
        children: function () {
            return json2html.transform(this.pargraphs, { tag: "p", html: "${description}" });
        }
    };

    $.json2View_transform = {
        blackBoard: transform_blackBoard,
        catalog: transform_catalog,
        catalog_sections: transform_catalog_sections,
        alert: transform_alert
    };

}( window.jQuery );