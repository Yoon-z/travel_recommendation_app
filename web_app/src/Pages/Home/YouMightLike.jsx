import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { handleErrorWTHCate, preloadImages} from './ImageLoad';

const api_server = process.env.REACT_APP_API_SERVER;

export default function YouMightLike({ userId }) {
    const [recom, setRecom] = useState(null);
    const [recom2, setRecom2] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    if (!userId) {
        console.error("userId is missing.")
    }

    useEffect(() => {
        async function fetchCluster() {
            // get recommend attractions by clusters of attractions
            let url = `${api_server}/recommendation/attracluster`;
            if (userId) {
                url += `?userId=${encodeURIComponent(userId)}`;
            }
            await fetch(url)
                .then(response => response.json())
                .then(async res => {
                    if (res) {
                        setRecom(res);
                        const allImageUrls = Object.values(res).flat().map(img => img.imageUrl);
                        await preloadImages(allImageUrls);
                    } else {
                        console.error("Recommedations by clusters missing in the response.");
                    }
                })
                .catch(err => {
                    console.error('Error fetching data: ', err);
                }).finally(setIsLoading(false));
        }

        async function fetchUserGroup() {
            // get recommend attractions by user groups
            let url = `${api_server}/recommendation/usergroup`;
            if (userId) {
                url += `?userId=${encodeURIComponent(userId)}`;
            }
            await fetch(url)
                .then(response => response.json())
                .then(async res => {
                    if (res) {
                        setRecom2(res);
                        const allImageUrls = Object.values(res).flat().map(img => img.imageUrl);
                        await preloadImages(allImageUrls);
                    } else {
                        console.log("Recommendation by user groups are missing in the response.");
                    }
                })
                .catch(err => {
                    console.error('Error fetching data: ', err);
                }).finally(setIsLoading(false));
        }

        fetchCluster();
        fetchUserGroup();
    }, [userId]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        (recom || recom2) && (
            <>
                {recom && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {recom.map(({ imageUrl, title, _id }, index) => (
                            <div key={_id} style={{ margin: '10px', width: '230px', textAlign: 'center' }}>
                                <Link to={`/attraction/${_id}`} style={{ textDecoration: 'none' }}>
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        style={{ 
                                            width: '230px', 
                                            height: '200px',
                                            borderRadius: '8px',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => handleErrorWTHCate(e)}
                                    />
                                    <h5 style={{ 
                                        margin: '8px 0 0 0',
                                        fontSize: '0.8rem',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontWeight: 500,
                                        color: '#666666',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        textAlign: 'center',
                                        textDecoration: 'none'
                                    }}>
                                        {title.charAt(0).toUpperCase() + title.slice(1)}
                                    </h5>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
                {recom2 && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {recom2.map(({ imageUrl, title, _id }, index) => (
                            <div key={_id} style={{ margin: '10px', width: '230px', textAlign: 'center' }}>
                                <Link to={`/attraction/${_id}`} style={{ textDecoration: 'none' }}>
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        style={{ 
                                            width: '230px', 
                                            height: '200px',
                                            borderRadius: '8px',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => handleErrorWTHCate(e)}
                                    />
                                    <h5 style={{ 
                                        margin: '8px 0 0 0',
                                        fontSize: '0.8rem',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontWeight: 500,
                                        color: '#666666',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        textAlign: 'center',
                                        textDecoration: 'none'
                                    }}>
                                        {title.charAt(0).toUpperCase() + title.slice(1)}
                                    </h5>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )
    );
}