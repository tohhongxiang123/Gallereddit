import React, {useContext, useEffect, useState} from 'react';
import './Navigation.css';
import {UserContext} from '../../UserContext';
import {SubredditContext} from '../../SubredditContext';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';
import MenuLogo from '../../assets/menu.svg';
import CloseLogo from '../../assets/close.svg';

function Navigation(props) {
    const [user, setUser] = useContext(UserContext);
    const [subreddit, setSubreddit] = useContext(SubredditContext);
    const [searchText, setSearchText] = useState(''); 
    const [menuIcon, setMenuIcon] = useState('menu');

    useEffect(() => {
        axios.get('/user/info').then(response => {
            const data = response.data;
            setUser(data);
        }).catch(e => {
            const {status, error} = e.response.data;
            console.log(`Unable to get user information, ${status}: ${error}`);
        });
    }, [setUser]);

    const logout = async () => {
        try {
            await axios.get('/user/logout');
            props.history.push('/');
        } catch(e) {
            const {status, error} = e.response.data;
            console.log(`Unable to log user out, ${status}: ${error}`);
        }
        
        setUser(null);
    }

    const handleChange = (e) => {
        setSearchText(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // a / infront is an absolute route, while no / infront is a relative route
        // this is to prevent problems going from /user/upvoted to /:subreddit
        props.history.replace('/' + searchText);
        setSubreddit(searchText);
        setSearchText('');
        toggleMenu();
    }

    const toggleMenu = (e) => {
        const nav_list = document.querySelector('.navigation-list');
        const menu_icon_element = document.querySelector('.menu-icon');

        if (menuIcon === 'menu') {
            menu_icon_element.src = CloseLogo;
            setMenuIcon('close');
        } else {
            menu_icon_element.src = MenuLogo;
            setMenuIcon('menu');
        }

        nav_list.classList.toggle('active');
    }

    const toggleUserCollectionMenu = () => {
        document.querySelector('.user-collection-menu').classList.toggle('active');
    }

    const redirectToUrl = async () => {
        try {
            const {data} = await axios.get('/user/login');
            const {url} = data;

            window.location = url;
        } catch(e) {
            const {status, error} = e.response.data;
            console.log(`Unable to log user out, ${status}: ${error}`);
        }
        
    }

    return (
            <nav className="navigation">
                <h2 className="navigation-brand"><Link to="/">Gallereddit</Link></h2>
                
                <div className="subreddit-name">
                <h3>{subreddit ? `r/${subreddit}` : 'Frontpage'}</h3>
                </div>

                <ul className="navigation-list">
                    <Link to="/">
                        <li>HOME</li>
                    </Link>
                    <li>
                        <form name="navigation-search" className='navigation-search' onSubmit={handleSubmit}>
                            <label htmlFor='subreddit-search'>Subreddit</label>
                            <div className="search-box-container">
                                <input type="text" placeholder="Subreddit" value={searchText} onChange={handleChange} name="subreddit-search"/>
                                <button type="submit" className="btn-primary submit-btn">Search</button>
                            </div>
                        </form>
                    </li> 
                    {!user ?
                    <a onClick={redirectToUrl}>
                        <li>
                            Login
                        </li>
                    </a>
                    :
                    <>
                        <li className='username' onClick={toggleUserCollectionMenu}><button><img src={user.icon_img} alt="User Profile Icon"/>{user.name}</button></li>
                        <div className="user-collection-menu">
                            <Link to="/user/upvoted"><li onMouseUp={toggleUserCollectionMenu}>Upvotes</li></Link>
                            <Link to="/user/saved"><li onMouseUp={toggleUserCollectionMenu}>Saves</li></Link>
                            <li onClick={logout}>Logout</li>
                        </div>
                        
                    </>
                    }
                </ul>

                <div className="navigation-menu-btn hidden" onClick={toggleMenu}>
                    <img src={MenuLogo} width='32' height='32' className='icon menu-icon' alt="Menu Icon"/>
                </div>
            </nav>
    )
}

export default withRouter(Navigation);
