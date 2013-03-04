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

class ComicMetaView extends Backbone.View
  initialize: (options = {}) =>
    {@pages} = options
    @pages.on 'change:fetched', @render
    @pages.on 'change:page', @render

  render: =>
    @$el.html("""
      <div class='page-index'>#{@pages.currentPageIndex + 1} of #{@pages.length}</div>
      <div class='progress'>Loaded #{@pages.percentFetched()}%</div>
    """)

class @ComicReader extends Backbone.View
  events:
    'click .comic-image': 'nextPage'

  initialize: (options = {}) =>
    $(document).on "keyup", @onKeyPress

    modelAttributes = _.map options.urls || [], (url) =>
      {url: url, fetched: false}
    @pages = new ComicPages(modelAttributes)
    @pages.on 'change:page', @showPage
    @render()
    @metaView = new ComicMetaView(el: ".comic-meta-wrap", pages: @pages)
    @pages.fetch()
    @pages.setCurrentPage(0)

  render: =>
    @$el.html("""
       <table class='comic-page-table' width="100%" height="100%" align="center" valign="center">
        <tr>
          <td class='comic-page-wrap'>
            <div class='comic-meta-wrap'></div>
            <div class='comic-image-wrap'></div>
          </td>
        </tr>
      </table>
    """)

  onKeyPress: (e) =>
    if e.keyCode == 37 # left arrow
      @previousPage()
    else if e.keyCode == 39 # right arrow
      @nextPage()

  showPage: (pageIndex) =>
    page = @pages.at(pageIndex)
    @$el.find(".comic-image-wrap").hide(0).html("""
        <img class='comic-image' src='#{page.get('url')}'>
      """).fadeIn(30)
    $(document).scrollTop(0)

  nextPage: =>
    @pages.setCurrentPage(@pages.currentPageIndex + 1)

  previousPage: =>
    @pages.setCurrentPage(@pages.currentPageIndex - 1)
