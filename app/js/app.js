(function musicBag() {
  /**
   * Navigation 
   * Loop a data and paste navigation with an anchor links
   * If "hasNavAnchor": false this item will not be rendered
   */
  let navItem = '';
  data.forEach(block => {
    if (block.hasNavAnchor) {
      navItem += `<li class="nav__item">
        <a class="nav__link ${block.anchor}" href="#${block.anchor}">${block.title}</a>
      </li>`
    }
  })

  const nav = `
  <nav class="nav">
    <ul class="nav__list">
      ${navItem}
    </ul>
  </nav>
  `
  document.querySelector('.navigation_wrapper').innerHTML = nav;

  /**
   * Main content
   * Loop a data and paste a content into the page
   */
  let content = '';
  data.forEach(block => {
    content += `<div id="${block.anchor}" class="block ${block.className ? block.className : ''}">
      <div class="category ${block.hasHeader ? '' : 'isHidden'}">
        <span class="section-title">
          ${block.title}
        </span>
      </div>
      <div class="intro container">${block.intro}</div>
  `

    block.releases && block.releases.forEach(release => {
      content +=
        `<div class="track">
        <div class="container">
          <div class="youtube video" data-embed="${release.id}">
            <div class="play-button"></div>
          </div>
          <div class="description">
            <div class="info">
              <div>
                <div><span>Artist:</span> ${release.artist}</div>
                <div><span> Album:</span> ${release.album}</div>
                <div><span>Release:</span> ${release.date}</div>
                ${release.instagram && `<span>Instagram: </span><a class="link" href="${release.instagram}" target="_blank">Link</a>`}
              </div>
              <img
                src="${release.cover}"
                class="cover"
              />
            </div>

            <div class="trackTitle">${release.track}</div>
            <p>${release.description}</p>
          </div>
        </div>
      </div>`
    })
    content += `</div>`
  });

  document.querySelector('.content').innerHTML = content;

  /**
   * Stop all YouTube videos
   */

  const stopPlyingAllVideos = () => {
    if (document.querySelector('.video iframe')) {
      Object.values(document.querySelectorAll('.video iframe')).forEach(item => {
        item.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
      })
    }
  }

  /**
   * YouTube lazy loading optimization
   * First step paste thumbnail images for each videos
   * After clicking on the image replace this one with embedded YouTube iframe
   */

  let players = [];

  (function () {
    let youtube = document.querySelectorAll(".youtube");

    for (let i = 0; i < youtube.length; i++) {
      const source = "https://img.youtube.com/vi/" + youtube[i].dataset.embed + "/sddefault.jpg";
      const image = new Image();

      image.src = source;
      image.addEventListener("load", function () {
        youtube[i].appendChild(image);
      }(i));
      image.classList.add('thumbnail')

      youtube[i].addEventListener("click", function () {
        const iframe = document.createElement("iframe");
        iframe.classList.add('iframe')
        const id = `player${i}`

        stopPlyingAllVideos();

        iframe.setAttribute("id", id);
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("src", "https://www.youtube.com/embed/" + this.dataset.embed + "?rel=0&showinfo=0&autoplay=1&enablejsapi=1");

        this.innerHTML = "";
        this.appendChild(iframe);

        const t = new YT.Player(iframe.getAttribute('id'), {
          events: {
            'onStateChange': onPlayerStateChange
          }
        });

        players.push(t);
      });
    };
  })();

  const playingTrackTitle = document.querySelector('.playing_track');
  let lastPlayed = '';

  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
      let temp = event.target.a.src;

      for (let i = 0; i < players.length; i++) {
        if (players[i].a.src != temp) {
          players[i].pauseVideo()
          lastPlayed = players[i];
        } else {
          lastPlayed = players[i];
          playingTrackTitle.innerHTML = players[i].getVideoData().title
          playingTrackTitle.classList.remove('isStop')
          playingTrackTitle.classList.add('isPlayingTrackShown');
        }
      }
    }

    if (event.data == YT.PlayerState.PAUSED) {
      playingTrackTitle.classList.add('isStop')
    }
  }

  /**
   * Toggle play/stop video on click the badge
   */
  let isPlaying = true;
  document.querySelector('.header').onclick = (e) => {
    if (e.target.classList.contains('isPlayingTrackShown')) {
      isPlaying ? lastPlayed.pauseVideo() : lastPlayed.playVideo();
      e.target.classList.toggle('isStop')
      isPlaying = !isPlaying
    }
  }


  /**
   * Smooth scrolling
   */
  const navigation = document.querySelector('.navigation_wrapper');
  navigation.onclick = (e) => {
    if (e.target.classList.contains('nav__link')) {
      e.preventDefault();
      const href = e.target.getAttribute('href');

      document.querySelector(`${href}`).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  };

  /**
   * Toggle Track List components: show nav item and iframe, hide track list button
   */
  const trackListNavItem = document.querySelector('.trackList')
  const trackListContainerWrapper = document.querySelector('.track_list');
  const showTrackListButton = document.querySelector('.track_list__show_button');
  const trackListYoutube = document.querySelector('.track_list__youtube');
  const trackListSpotify = document.querySelector('.track_list__spotify');
  const youTubeTrackList = `
    <iframe width="100%" height="500" src="https://www.youtube.com/embed/videoseries?list=PLx_GCmLuHXJnTWJtlmykgRhiFRoohq8dy" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  const spotifyTrackList = `
    <iframe src="https://open.spotify.com/embed/user/artem_drei/playlist/1XsovXDTtikBn5NnjKG19s" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`

  const togglePlayListComponents = () => {
    if (localStorage.getItem('isTrackListShown') === 'true') {
      trackListYoutube.innerHTML = youTubeTrackList;
      trackListSpotify.innerHTML = spotifyTrackList;
      trackListContainerWrapper.classList.add('isShownTrackList')
      trackListNavItem.classList.add('isShown');
    }
  }

  togglePlayListComponents();

  showTrackListButton.onclick = () => {
    localStorage.setItem('isTrackListShown', true);
    togglePlayListComponents();
  }

  /**
   * Burger menu
   */
  const burger = document.querySelector('.burger');
  const navigationWrapper = document.querySelector('.navigation_wrapper')

  burger.onclick = (e) => {
    e.target.closest('.burger').classList.toggle('isArrow')
    navigationWrapper.classList.toggle('isNavigationOpen')
  }

  const closeNavigationMenu = () => {
    burger.classList.remove('isArrow')
    navigationWrapper.classList.remove('isNavigationOpen')
  }

  window.onkeyup = (e) => {
    if (e.keyCode === 27) {
      closeNavigationMenu();
    }
  }

  window.onclick = (e) => {
    if (navigationWrapper.classList.contains('isNavigationOpen')
      && e.target.closest('.container')) {
      closeNavigationMenu();
    }
  }
})();
