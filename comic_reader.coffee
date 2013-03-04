class ComicPage extends Backbone.Model
  fetch: =>
    preloader = new ImagePreloader
      urls: [@get('url')]
      complete: @onImageLoad
    preloader.start()

  onImageLoad: =>
    @set('fetched', true)

class ComicPages extends Backbone.Collection
  model: ComicPage

  fetch: =>
    _.map @models, (model) => model.fetch()

class @ComicReader extends Backbone.View
  events:
    'click .comic-page': 'nextPage'

  initialize: (options = {}) =>
    $(document).on "keyup", @onKeyPress

    modelAttributes = _.map options.urls || [], (url) =>
      {url: url, fetched: false}
    @pages = new ComicPages(modelAttributes)
    @render()
    @pages.fetch()
    @currentPageIndex = 0
    @showPage(@currentPageIndex)  if @pages.length > 0

  render: =>
    @$el.html("""
      <div class='comic-page-wrap'></div>
    """)

  onKeyPress: (e) =>
    if e.keyCode == 37 # left arrow
      @previousPage()
    else if e.keyCode == 39 # right arrow
      @nextPage()

  showPage: (pageIndex) =>
    @currentPageIndex = pageIndex
    page = @pages.at(pageIndex)
    @$el.find(".comic-page-wrap").html("""
      <img class='comic-page' src='#{page.get('url')}'>
    """)

  nextPage: =>
    @showPage(@currentPageIndex + 1)  if @currentPageIndex + 1 < @pages.length

  previousPage: =>
    @showPage(@currentPageIndex - 1)  if @currentPageIndex - 1 >= 0
