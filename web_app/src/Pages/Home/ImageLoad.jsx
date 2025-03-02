import nature from '../../images/nature.jpg';
import animal from '../../images/animal.jpg';
import architecture from '../../images/architecture.jpg';
import history from '../../images/history.jpg';
import culture from '../../images/culture.jpg';
import hiking from '../../images/hiking.jpg';
import park from '../../images/park.jpg';
import museum from '../../images/museum.jpg';
import religion from '../../images/religion.jpg';
import amusement from '../../images/amusement.jpg';
import senic_spot from '../../images/senic_spot.jpg';
import botanical from '../../images/botanical.jpg';
import sport from '../../images/sport.jpg';

const images = {
    'Nature': nature,
    'Animal': animal,
    'Architecture': architecture,
    'History': history,
    'Culture': culture,
    'Hiking': hiking,
    'Park': park,
    'Museum': museum,
    'Religion': religion,
    'Amusement': amusement,
    'Senic Spot': senic_spot,
    'Botanical': botanical,
    'Sport': sport,
};

const imageArray = [
    { src: nature, name: 'Nature' },
    { src: animal, name: 'Animal' },
    { src: architecture, name: 'Architecture' },
    { src: history, name: 'History' },
    { src: culture, name: 'Culture' },
    { src: hiking, name: 'Hiking' },
    { src: park, name: 'Park' },
    { src: museum, name: 'Museum' },
    { src: religion, name: 'Religion' },
    { src: amusement, name: 'Amusement' },
    { src: senic_spot, name: 'Senic Spot' },
    { src: botanical, name: 'Botanical' },
    { src: sport, name: 'Sport' },
];

export function handleError(e, category) {
    console.log('Error loading image, falling back to category:', category);
    e.target.src = images[category];
    e.target.onerror = null;
}

export function handleErrorWTHCate(e) {
    console.log('Error loading image, handling without category');
    e.target.src = images['Nature'];
    e.target.onerror = null;
}

export function load() {
    return images;
}

export function loadArray() {
    return imageArray;
}

export async function preloadImages(imageUrls) {
    console.log('Preloading images');
    const promises = imageUrls.map(url => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    await Promise.all(promises);
}