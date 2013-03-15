// Generated by CoffeeScript 1.5.0
(function() {
  var ComicMetaView, ComicReaderRouter, ComicReaderView, Page, Pages,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Page = (function(_super) {

    __extends(Page, _super);

    function Page() {
      this.onImageLoad = __bind(this.onImageLoad, this);
      this.fetch = __bind(this.fetch, this);
      Page.__super__.constructor.apply(this, arguments);
    }

    Page.prototype.fetch = function() {
      var preloader;
      preloader = new ImagePreloader({
        urls: [this.get('url')],
        complete: this.onImageLoad
      });
      return preloader.start();
    };

    Page.prototype.onImageLoad = function() {
      return this.set('fetched', true);
    };

    return Page;

  })(Backbone.Model);

  Pages = (function(_super) {

    __extends(Pages, _super);

    function Pages() {
      this.setSizeTransform = __bind(this.setSizeTransform, this);
      this.hasPreviousPage = __bind(this.hasPreviousPage, this);
      this.hasNextPage = __bind(this.hasNextPage, this);
      this.setCurrentPage = __bind(this.setCurrentPage, this);
      this.percentFetched = __bind(this.percentFetched, this);
      this.fetched = __bind(this.fetched, this);
      this.fetch = __bind(this.fetch, this);
      this.initialize = __bind(this.initialize, this);
      Pages.__super__.constructor.apply(this, arguments);
    }

    Pages.prototype.model = Page;

    Pages.prototype.initialize = function() {
      return this.currentPageIndex = 0;
    };

    Pages.prototype.fetch = function() {
      var _this = this;
      return _.map(this.models, function(model) {
        return model.fetch();
      });
    };

    Pages.prototype.fetched = function() {
      var _this = this;
      return _.filter(this.models, function(model) {
        return model.get('fetched');
      });
    };

    Pages.prototype.percentFetched = function() {
      return Math.round(this.fetched().length / this.size() * 100);
    };

    Pages.prototype.setCurrentPage = function(pageIndex) {
      if (!(pageIndex >= 0 && pageIndex < this.models.length)) {
        return;
      }
      this.currentPageIndex = pageIndex;
      return this.trigger('change:page', pageIndex);
    };

    Pages.prototype.hasNextPage = function() {
      return this.currentPageIndex < this.models.length - 1;
    };

    Pages.prototype.hasPreviousPage = function() {
      return this.currentPageIndex > 0;
    };

    Pages.prototype.setSizeTransform = function(type) {
      var _this = this;
      this.map(function(model) {
        return model.set('size_transform', type, {
          silent: true
        });
      });
      return this.trigger('change:page', this.currentPageIndex);
    };

    return Pages;

  })(Backbone.Collection);

  ComicMetaView = (function(_super) {

    __extends(ComicMetaView, _super);

    function ComicMetaView() {
      this.render = __bind(this.render, this);
      this.progressIndicatorStyle = __bind(this.progressIndicatorStyle, this);
      this.fullSize = __bind(this.fullSize, this);
      this.fillHeight = __bind(this.fillHeight, this);
      this.fillWidth = __bind(this.fillWidth, this);
      this.initialize = __bind(this.initialize, this);
      ComicMetaView.__super__.constructor.apply(this, arguments);
    }

    ComicMetaView.prototype.events = {
      'click .fill-width': 'fillWidth',
      'click .fill-height': 'fillHeight',
      'click .full-size': 'fullSize'
    };

    ComicMetaView.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      this.pages = options.pages;
      this.pages.on('change:fetched', this.render);
      return this.pages.on('change:page', this.render);
    };

    ComicMetaView.prototype.fillWidth = function() {
      return this.pages.setSizeTransform("fillWidth");
    };

    ComicMetaView.prototype.fillHeight = function() {
      return this.pages.setSizeTransform("fillHeight");
    };

    ComicMetaView.prototype.fullSize = function() {
      return this.pages.setSizeTransform(null);
    };

    ComicMetaView.prototype.progressIndicatorStyle = function() {
      var width;
      width = 100 / this.pages.size();
      return "width:" + width + "%;left:" + (width * this.pages.currentPageIndex) + "%;";
    };

    ComicMetaView.prototype.render = function() {
      return this.$el.html("<div class='progress'>\n  <div class='progress-indicator' style='" + (this.progressIndicatorStyle()) + "'></div>\n  <div class='progress-inner' style='width:" + (this.pages.percentFetched()) + "%'></div>\n</div>\n<nav class='clearfix'>\n  <div class='page-index'>" + (this.pages.currentPageIndex + 1) + " of " + this.pages.length + "</div>\n  <div class='page-size'>\n    <button class='fill-width'>Fill width &#8596;</button>\n    <button class='full-size'>Full size</button>\n    <button class='fill-height'>Fill height &#8597;</button>\n  </div>\n</nav>");
    };

    return ComicMetaView;

  })(Backbone.View);

  ComicReaderView = (function(_super) {

    __extends(ComicReaderView, _super);

    function ComicReaderView() {
      this.showPage = __bind(this.showPage, this);
      this.render = __bind(this.render, this);
      this.initialize = __bind(this.initialize, this);
      ComicReaderView.__super__.constructor.apply(this, arguments);
    }

    ComicReaderView.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      this.pages = options.pages;
      this.pages.on('change:page', this.showPage);
      this.render();
      return this.metaView = new ComicMetaView({
        el: ".comic-meta-wrap",
        pages: this.pages
      });
    };

    ComicReaderView.prototype.render = function() {
      return this.$el.html("<div class='comic-meta-wrap'></div>\n<div class='comic-image-wrap'></div>");
    };

    ComicReaderView.prototype.showPage = function(pageIndex) {
      var html, page, style;
      page = this.pages.at(pageIndex);
      style = "";
      if (page.get('size_transform') === "fillWidth") {
        style = "width:100%";
      } else if (page.get('size_transform') === "fillHeight") {
        style = "height:100%";
      }
      html = "<img class='comic-image' src='" + (page.get('url')) + "' style='" + style + "'>";
      if (this.pages.hasNextPage()) {
        html = "<a href='#p" + (pageIndex + 2) + "'>" + html + "</a>";
      }
      this.$el.find(".comic-image-wrap").hide(0).html(html).fadeIn(50);
      return $(document).scrollTop(0);
    };

    return ComicReaderView;

  })(Backbone.View);

  ComicReaderRouter = (function(_super) {

    __extends(ComicReaderRouter, _super);

    function ComicReaderRouter() {
      this["default"] = __bind(this["default"], this);
      this.read = __bind(this.read, this);
      this.initialize = __bind(this.initialize, this);
      ComicReaderRouter.__super__.constructor.apply(this, arguments);
    }

    ComicReaderRouter.prototype.routes = {
      "p:page": "read",
      "*path": "default"
    };

    ComicReaderRouter.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      return this.pages = options.pages, options;
    };

    ComicReaderRouter.prototype.read = function(page) {
      return this.pages.setCurrentPage(parseInt(page) - 1);
    };

    ComicReaderRouter.prototype["default"] = function(path) {
      return this.pages.setCurrentPage(0);
    };

    return ComicReaderRouter;

  })(Backbone.Router);

  this.ComicReader = (function() {

    function ComicReader(options) {
      var pages, router, view,
        _this = this;
      if (options == null) {
        options = {};
      }
      pages = new Pages(_.map(options.urls || [], function(url) {
        return {
          url: url,
          fetched: false
        };
      }));
      options.pages = pages;
      view = new ComicReaderView(options);
      router = new ComicReaderRouter({
        pages: pages
      });
      Backbone.history.start({
        pushState: false
      });
      pages.fetch();
      $(document).on("keyup", function(e) {
        var pageDelta, _ref;
        if ((_ref = e.keyCode) !== 37 && _ref !== 39) {
          return;
        }
        if (e.keyCode === 37) {
          if (!pages.hasPreviousPage()) {
            return;
          }
          pageDelta = -1;
        } else if (e.keyCode === 39) {
          if (!pages.hasNextPage()) {
            return;
          }
          pageDelta = 1;
        }
        return window.location.hash = "p" + (pages.currentPageIndex + pageDelta + 1);
      });
    }

    return ComicReader;

  })();

}).call(this);
