import classes from 'classnames';
import React, { MemoExoticComponent, ReactNode, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import Api from './api/Api';
import { Loading } from './api/Hooks';
import './style/app.scss';
import Dialog, { Provider as DialogProvider } from './components/Dialog';
import Settings, { useSettingsProvider, Provider as SettingsProvider } from './components/Settings';
import Cell from './components/Cell';
import Login from './pages/Login';
import UserPanel from './pages/UserPanel';
import Apikeys from './pages/Apikeys';
import Timeline from './components/Timeline';
import Entries from './pages/Entries';
import { settings } from 'cluster';

const SinglePage = ({ children }: { children: ReactNode }) => {
	return <section className='single'>{children}</section>;
}

const Logout = () => {
	useEffect(() => {
		Api.logout();
	});
	return <Redirect to='' />
}

const App = () => {
	const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

	useEffect(() => {
		Api.isLoggedIn().then(b => setLoggedIn(b));
	}, []);

	const dialog = useState<JSX.Element | null>(null);

	const [settings, setSettings] = useSettingsProvider();
	const { theme } = settings.client;

	const pages: IPage[] = [
		{ path: '/user', component: UserPanel },
		{ path: '/timeline', component: Entries },
		{ path: '/settings', component: Settings },
		{ path: '/settings/logins', component: Apikeys },
	];

	return (
		<SettingsProvider value={[settings, setSettings]}>
			<DialogProvider value={dialog}>

				<Router>
					<section className={classes(theme)}>
						{loggedIn
							? <section className='container'>

								<Dialog />

								<Switch>

									{pages.map(page =>
										<Route key={page.path} path={page.path}>
											<Page {...page} />
										</Route >
									)}

									<Route exact path='/'>
										<Redirect to='/timeline' />
									</Route>

									<Route path='/logout'>
										<Logout />
									</Route>

									<Route>
										<Cell area='page'>
											<h1 className='empty-info'>404 - Not Found</h1>
										</Cell>
									</Route>

								</Switch>
							</section>

							: <SinglePage>
								{loggedIn === false
									? <Login />
									: <Loading />
								}
							</SinglePage>
						}
					</section>
				</Router>

			</DialogProvider>
		</SettingsProvider>
	);
}

export interface IPage {
	path: string;
	component: (() => JSX.Element | null) | MemoExoticComponent<() => JSX.Element | null>;
	id?: string;
	text?: string;
}

const Page = (page: IPage) => {

	const path = useLocation().pathname.slice(1) + '/';
	const id = page.id ?? path.slice(0, path.indexOf('/'));

	useEffect(() => {
		document.title = id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
	}, [id]);

	return (
		<Cell area='page' id={id}>
			<page.component />
		</Cell>
	);
}

export default App;
