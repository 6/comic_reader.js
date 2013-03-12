class Page extends Backbone.Model
  fetch: =>
    preloader = new ImagePreloader
      urls: [@get('url')]
      complete: @onImageLoad
    preloader.start()

  onImageLoad: =>
    @set('fetched', true)

class Pages extends Backbone.Collection
  model: Page

  initialize: =>
    @currentPageIndex = 0

  fetch: =>
    _.map @models, (model) => model.fetch()

  fetched: =>
    _.filter @models, (model) =>
      model.get('fetched')

  percentFetched: =>
    Math.round(@fetched().length / @size() * 100)

  setCurrentPage: (pageIndex) =>
    return  unless pageIndex >= 0 && pageIndex < @models.length
    @currentPageIndex = pageIndex
    @trigger('change:page', pageIndex)

  hasNextPage: =>
    @currentPageIndex < @models.length - 1

  hasPreviousPage: =>
    @currentPageIndex > 0

  setSizeTransform: (type) =>
    @map (model) => model.set('size_transform', type, silent: true)
    @trigger('change:page', @currentPageIndex)

class ComicMetaView extends Backbone.View
  events:
    'click .fill-width': 'fillWidth'
    'click .fill-height': 'fillHeight'
    'click .full-size': 'fullSize'

  initialize: (options = {}) =>
    {@pages} = options
    @pages.on 'change:fetched', @render
    @pages.on 'change:page', @render

  fillWidth: =>
    @pages.setSizeTransform("fillWidth")

  fillHeight: =>
    @pages.setSizeTransform("fillHeight")

  fullSize: =>
    @pages.setSizeTransform(null)

  render: =>
    @$el.html("""
      <div class='progress'>
        <div class='progress-inner' style='width:#{@pages.percentFetched()}%'></div>
      </div>
      <nav class='clearfix'>
        <div class='page-index'>#{@pages.currentPageIndex + 1} of #{@pages.length}</div>
        <div class='page-size'>
          <button class='fill-width'>Fill width &#8596;</button>
          <button class='full-size'>Full size</button>
          <button class='fill-height'>Fill height &#8597;</button>
          </div>
      </nav>
    """)

class ComicReaderView extends Backbone.View
  initialize: (options = {}) =>
    {@pages} = options
    @pages.on 'change:page', @showPage
    @render()
    @metaView = new ComicMetaView(el: ".comic-meta-wrap", pages: @pages)

  render: =>
    @$el.html("""
      <div class='comic-meta-wrap'></div>
      <div class='comic-image-wrap'></div>
    """)

  showPage: (pageIndex) =>
    page = @pages.at(pageIndex)

    style = ""
    if page.get('size_transform') == "fillWidth"
      style = "width:100%"
    else if page.get('size_transform') == "fillHeight"
      style = "height:100%"

    html = "<img class='comic-image' src='#{page.get('url')}' style='#{style}'>"
    if @pages.hasNextPage()
      html = "<a href='#p#{pageIndex + 2}'>#{html}</a>"
    @$el.find(".comic-image-wrap").hide(0).html(html).fadeIn(50)
    $(document).scrollTop(0)

class ComicReaderRouter extends Backbone.Router
  routes:
    "p:page": "read"
    "*path": "default"

  initialize: (options = {}) =>
    {@pages} = options

  read: (page) =>
    @pages.setCurrentPage(parseInt(page) - 1)

  default: (path) =>
    @pages.setCurrentPage(0)

class @ComicReader
  constructor: (options = {}) ->
    pages = new Pages(_.map(options.urls || [], (url) => {url: url, fetched: false}))
    options.pages = pages
    view = new ComicReaderView(options)
    router = new ComicReaderRouter(pages: pages)

    Backbone.history.start(pushState: false)
    pages.fetch()

    $(document).on "keyup", (e) =>
      return  unless e.keyCode in [37, 39]
      if e.keyCode == 37 # left arrow
        return  unless pages.hasPreviousPage()
        pageDelta = -1
      else if e.keyCode == 39 # right arrow
        return  unless pages.hasNextPage()
        pageDelta = 1
      window.location.hash = "p#{pages.currentPageIndex + pageDelta + 1}"
