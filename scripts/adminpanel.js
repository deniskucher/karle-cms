/**
* AdminPanel
* @author  Kucher Denis   <dkucher88@gmail.com>
* @copyright Copyright &copy; 2016-2017 Denis Kucher <dkucher88@gmail.com>
* @created 2017.01.28
*/
$.widget('dk.adminpanel', {

    options: {
        dummy: 'dummy',
        domainName:null,
        menuContent:null
    },
    

    _create: function () {
        var widget = this;
       
        this.element.on('click', 'nav.sidebar-nav>ul li', function (e) {
           
            if ($(this).data('id') == 'home') {
                // $(this).find('a.ripple').trigger('click');
                // e.preventDefault();
                return;
            }; 
            e.preventDefault();
            $('nav.sidebar-nav>ul li.active').removeClass('active');
            $('.dropdown-menu-ul li.active').removeClass('active');
            $('#selectview').remove();
            $(this).addClass('active');
            $item = $(this).attr('data-id');
            widget._createContent($item);
            $('aside.sidebar-container').removeClass('sidebar-container-visible');
            $('.sidebar-layout-obfuscator').removeClass('obfuscator-visible');
            
        });

        this.element.on('click', '.dropdown-menu-ul li', function (e) {
            if ($(this).data('id') == 'logout') {
                e.preventDefault();
                var logout = $(this);
                var href = logout.find('a').attr('href');
                widget._logoutFacebook(href);
            }else{
                e.preventDefault();
                $('.dropdown-menu-ul li.active').removeClass('active');
                $('nav.sidebar-nav>ul li.active').removeClass('active');
                $('#selectview').remove();
                $(this).addClass('active');
                widget._createContent($(this).attr('data-id'));    
            }
        });
        
        $('body').on('click', 'li.admin-menu-block>a.sign-out', function (e) {
            e.preventDefault();
            var logout = $(this);
            var href = logout.attr('href');
            widget._logoutFacebook(href);
        });

        this.element.on('click', 'ul.pull-right li.dropdown', function (e) {
            e.preventDefault();
            $('ul.dropdown-menu-ul').slideToggle('fast');
            
        });

        $(document).bind('click', function (e) {
            var $clicked = $(e.target);
            if (!$clicked.parents().hasClass('sidebar-container') & !$clicked.hasClass('visible-xs') & !$clicked.parents().hasClass('visible-xs')) {
                $('aside.sidebar-container').removeClass('sidebar-container-visible');
                $('.sidebar-layout-obfuscator').removeClass('obfuscator-visible');
            }
            if (!$clicked.parents().hasClass('dropdown-menu-ul') & !$clicked.parents().hasClass('dropdown')) {
                $('ul.dropdown-menu-ul').hide('fast');
            }
        });
        this.element.on('click', 'li#sendvich-menu', function (e) {
            e.preventDefault();
            widget.element.find('aside.sidebar-container').addClass('sidebar-container-visible');
            widget.element.find('.sidebar-layout-obfuscator').addClass('obfuscator-visible');
            
        });
        this._getDomainName();
        
    },

    _logoutFacebook:function(_href){
        var widget = this;
        FB.getLoginStatus(function(response) {
            if ((response.status)&&(response.status=='connected')) {
                FB.logout(function(response) {
                    location.href = _href;        
                },true);        
            }else{
                location.href = _href;
            }
            
        }, true);
        
    },

    _getDomainName: function () {
        var widget = this;
        
        sendRequest({
            action: 'basic.getdomainname',
            data: {},
            
            successHandler: function (_callbackParams) {
                var response = _callbackParams.response;
                if (!response.success) {
                    alert(response.message);
                }
                else{
                    widget.options.domainName = response.data.domainname;
                    widget._createLayout();
                    widget._createContent();
                    
                }
            }
        });
    },
    _createLayout: function () {
        var widget = this;
        var dict = widget.options.dict;
        var domainName = widget.options.domainName;
        if (domainName) domainName = domainName[0].toUpperCase() + domainName.slice(1);
        widget.element.append(
            $('<header/>',{class:'header-container'}).append(
                $('<nav/>').append(
                    $('<ul/>').append(
                        $('<li/>',{class:'visible-xs visible-sm hidden-md', id:'sendvich-menu'}).append(
                            $('<a/>',{href:'#', class:'menu-link menu-link-slide'}).append(
                                $('<span/>').append($('<em/>'))
                            )
                            
                        )
                    ),
                    $('<h2/>',{class:'header-title'}),
                    $('<ul>',{class:'pull-right'}).append(
                        $('<li/>',{class:'dropdown'}).append(
                            $('<a/>',{href:'#',class:'dropdown-toggle has-badge ripple'}).append(
                                $('<span/>',{class:'glyphicon glyphicon-user'}),
                                $('<span/>',{class:'md-ripple', style:'width: 0px; height: 0px; margin-top: -32px; margin-left: -32px;'})
                            ),
                            $('<div/>',{class:'dropdown-menu-users'}).append(
                                $('<ul/>',{class:'dropdown-menu-ul'}).append(
                                    $('<li/>',{class:'ripple ripple-block'}).attr('data-id','profile').append(
                                        $('<a/>',{href:"#"}).append(
                                            $('<span/>',{class:'glyphicon glyphicon-home'}),
                                            $('<span/>',{class:'menu-item'}).text(dict.profile),
                                            $('<span/>',{class:'md-ripple'})
                                        )
                                    ),
                                    $('<li/>',{class:'ripple ripple-block'}).attr('data-id','settings').append(
                                        $('<a/>',{href:"#"}).append(
                                            $('<span/>',{class:'glyphicon glyphicon-cog'}),
                                            $('<span/>',{class:'menu-item'}).text(dict.settings),
                                            $('<span/>',{class:'md-ripple'})
                                        )
                                    ),
                                    $('<li/>',{class:'divider'}),
                                    $('<li/>',{class:'ripple ripple-block'}).attr('data-id','logout').append(
                                        $('<a/>',{href:widget.options.logouthref}).append(
                                            $('<span/>',{class:'glyphicon glyphicon-log-out'}),
                                            $('<span/>',{class:'menu-item'}).text(dict.logout),
                                            $('<span/>',{class:'md-ripple'})
                                        )
                                    )
                                )
                            )
                        ),
                        $('<div/>',{class:'switch-header'}).append(
                            $('<a/>',{href: widget.options.switchlang.languagesrc}).append(
                                $('<img/>',{src:widget.options.switchlang.languageiconsrc, alt:widget.options.switchlang.alt, title:widget.options.switchlang.alt})
                            )
                        ),
                        $('<div/>',{class:'switch-header'}).append(
                            $('<a/>',{href: widget.options.switchadaptive.hrefsrc}).append(
                                $('<img/>',{src:widget.options.switchadaptive.iconsrc, alt:widget.options.dict.admin_panel_usual, title:widget.options.dict.admin_panel_usual})
                            )
                        )
                    )
                )
            ),
            $('<aside/>',{class:'sidebar-container'}).append(
                $('<div/>',{class:'sidebar-header'}).append(
                    $('<a/>',{href:'#', class:'sidebar-header-logo'}).append(
                        $('<span/>',{class:'logo-karle-cms'}),
                        $('<span/>',{class:'sidebar-header-logo-text'}).text(domainName)
                    )
                ),
                $('<div/>',{class:'sidebar-content'}).append(
                    $('<nav/>',{class:'sidebar-nav'}).append(
                        $menu = $('<ul/>').append(
                            
                        )
                    )
                )
            ),
            $('<div/>',{class:'sidebar-layout-obfuscator'}),
            $('<main/>',{class:'main-container'}).append(
                $('<section/>').append(
                    widget.options.menuContent = $('<div/>')
                ),
                $('<footer/>').append(
                    $('<span/>').text(new Date().getFullYear()+' - '+ window.location.hostname)
                )
            )

        );

        
        var adminMenu = {
            Home:{title:dict.home, icon:'glyphicon glyphicon-home', href:widget.options.homehref}, 
            News:{title:dict.news,icon:'glyphicon glyphicon-list-alt', href:'#'}, 
            Horses:{title:dict.horses, icon:'glyphicon glyphicon-eye-open', href:'#'},
            Prices:{title:dict.prices, icon:'glyphicon glyphicon-euro', href:'#'},
            Menu:{title:dict.menu, icon:'glyphicon glyphicon-align-justify', href:'#'},
            Gallery:{title:dict.gallery, icon:'glyphicon glyphicon-picture', href:'#'},
            Pages:{title:dict.pages, icon:'glyphicon glyphicon-file', href:'#'},
            Views:{title:dict.views, icon:'glyphicon glyphicon-edit', href:'#'},
            Tags:{title:dict.tags, icon:'glyphicon glyphicon-pushpin', href:'#'}
        };
        
        for (var item in adminMenu) {
        
            $menu.append(
                $('<li/>').attr('data-id', item.toLowerCase()).append(
                    $('<a/>',{href: adminMenu[item]['href'], class:'ripple'}).append(
                        $('<span/>',{class: adminMenu[item]['icon']}),
                        $('<span/>',{class:'menu-item'}).text(adminMenu[item]['title']),
                        $('<span/>',{class:'md-ripple'})
                    )
                )
            );
        };
        
    },
    
    _createContent: function(_id){
        var widget = this;
        var sessionPage = sessionStorage.getItem('page-data-id');
        var pageId = _id || sessionPage;
        sessionStorage.setItem('page-data-id', pageId);
        switch (pageId) {
            case 'home':
                widget._homeContent();
                break;
            case 'news':
                widget._newsContent();
                break;
            case 'horses':
                widget._horsesContent();
                break;
            case 'settings':
                widget._settingsContent();
                break;
            case 'prices':
                widget._pricesContent();
                break;
            case 'menu':
                widget._menuContent();
                break;
            case 'gallery':
                widget._galleryContent();
                break;
            case 'pages':
                widget._pagesContent();
                break;
            case 'views':
                widget._viewsContent();
                break;
            case 'tags':
                widget._tagsContent();
                break;
            case 'profile':
                widget._profileContent();
                break;
            default:
                sessionStorage.setItem('page-data-id', 'profile');
                widget._profileContent();
                
                
        }
    },
    _homeContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=home]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.home);
        $('div.container-fluid').remove();
        widget.options.menuContent.append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card'}).append(
                    $('<div/>',{class:'card-body'}).append(
                        $('<p/>').text('Content for '+widget.options.dict.home)
                    )
                )
            )
        ); 
    },
    _newsContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=news]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.news);
        $('div.container-fluid').remove();
            widget.options.menuContent.append(
                $('<div/>',{class:'container-fluid'}).append(
                    $('<div/>',{class:'card', id:'news-manager'}).newsmanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                        $('<div/>',{class:'card-heading'})
                        
                    )
                )
            ); 
        
    },
    _horsesContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=horses]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.horses);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card', id:'horses-manager'}).horsesmanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
    },
    _settingsContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=settings]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.settings);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card', id:'settings-manager'}).settingsmanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
    },
    _pricesContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=prices]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.prices);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card', id:'prices-manager'}).pricesmanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
    },
    _menuContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=menu]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.menu);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card', id:'menu-manager'}).menumanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
    },
    _galleryContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=gallery]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.gallery);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $galleryManager = $('<div/>',{class:'card', id:'gallery-manager'}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
        $galleryManager.gallerymanager({dict: widget.options.dict, lang: widget.options.lang});
    },
    _pagesContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=pages]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.pages);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card', id:'pages-manager'}).pagesmanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
    },
    _viewsContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=view]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.views);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card', id:'views-manager'}).viewsmanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
    },
    _tagsContent: function(){
        var widget = this;
        $('nav.sidebar-nav li[data-id=tags]').addClass('active');
        $('header.header-container h2.header-title').text(widget.options.dict.tags);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card', id:'tags-manager'}).tagsmanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
    },
    _profileContent: function(){
        var widget = this;
        $('header.header-container h2.header-title').text(widget.options.dict.profile);
        $('div.container-fluid').remove();
        widget.options.menuContent.empty().append(
            $('<div/>',{class:'container-fluid'}).append(
                $('<div/>',{class:'card', id:'profile-manager'}).profilemanager({dict: widget.options.dict, lang: widget.options.lang}).append(
                    $('<div/>',{class:'card-heading'})
                )
            )
        );
    }

});
(function($) {      // поиск и удаление класса по шаблону // $('p').removeClassWild("status_*");
    $.fn.removeClassWild = function(mask) {
        return this.removeClass(function(index, cls) {
            var re = mask.replace(/\*/g, '\\S+');
            return (cls.match(new RegExp('\\b' + re + '', 'g')) || []).join(' ');
        });
    };
})(jQuery);
                        