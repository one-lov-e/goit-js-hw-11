import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import PixabayApiServise from './js/fetch-pixabay';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchForm: document.querySelector('#search-form'),
  pictureContainer: document.querySelector('.gallery'),
};

const pixabayApiServise = new PixabayApiServise();
let perPage = 0;

refs.searchForm.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();
  pixabayApiServise.query = e.currentTarget.elements.searchQuery.value;
  pixabayApiServise.resetPage();
  perPage = 0;
  console.log('submit');
  window.addEventListener('scroll', handleScroll);
  appendPictureMarkup();
  clearPictureContainer();
}

function clearPictureContainer() {
  refs.pictureContainer.innerHTML = '';
}

function notifyMessage(hits, totalHits, perPage) {
  if ((hits.length !== 0) & (perPage === pixabayApiServise.per_page)) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  if (hits.length === 0 && totalHits === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );

    return;
  }
  if (perPage > totalHits) {
    Notify.info(`We're sorry, but you've reached the end of search results.`);
    window.removeEventListener('scroll', handleScroll);
    return;
  }
}

function simpleLightbox() {
  let gallery = new SimpleLightbox('.photo-card a', {});
  gallery.refresh();
}

async function appendPictureMarkup() {
  try {
    const response = await pixabayApiServise.fetchPicture();
    const {
      data: { hits, totalHits },
    } = response;
    refs.pictureContainer.insertAdjacentHTML('beforeend', renderMarkup(hits));
    perPageCounter();
    notifyMessage(hits, totalHits, perPage);
  } catch (error) {
    console.log(error.message);
  }
  simpleLightbox();
}

function renderMarkup(hits) {
  return hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        likes,
        views,
        comments,
        tags,
        downloads,
      }) => {
        return `<div class='photo-card'>
    <a href='${largeImageURL}'><img
        src='${webformatURL}'
        alt='${tags}'
        loading='lazy'
      /></a>
    <div class='info'>
      <p class='info-item'>
        <b>Likes</b>
        ${likes}
      </p>
      <p class='info-item'>
        <b>Views</b>
        ${views}
      </p>
      <p class='info-item'>
        <b>Comments</b>
        ${comments}
      </p>
      <p class='info-item'>
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
  </div>`;
      }
    )
    .join('');
}

function perPageCounter() {
  perPage += pixabayApiServise.per_page;
}

function handleScroll() {
  console.log('scroll-start');
  if (
    window.scrollY + window.innerHeight >
    document.documentElement.scrollHeight
  ) {
    console.log('y=', window.scrollY);
    console.log('H=', window.innerHeight);
    console.log('sH=', document.documentElement.scrollHeight);
    console.log('scroll in if');
    appendPictureMarkup();
  }
}
