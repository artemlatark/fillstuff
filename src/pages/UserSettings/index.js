import React from 'react';
import loadable from '@loadable/component';

import generateMetaInfo from 'shared/generate-meta-info';

import Head from 'src/components/head';
import HeaderPage from 'src/components/HeaderPage';
import { LoadingPage } from 'src/components/Loading';

import stylesPage from 'src/styles/page.module.css';
import styles from './index.module.css';

const Index = loadable(() => import('./containers/index' /* webpackChunkName: "UserSettings_Index" */), {
	fallback: <LoadingPage />,
});

const UserSettings = () => {
	const metaInfo = {
		pageName: 'user-settings',
		pageTitle: 'Настройки аккаунта',
	};
	const { title, description } = generateMetaInfo({
		type: metaInfo.pageName,
		data: {
			title: metaInfo.pageTitle,
		},
	});

	return (
		<div className={stylesPage.page}>
			<Head title={title} description={description} />

			<HeaderPage pageName={metaInfo.pageName} pageTitle={metaInfo.pageTitle} />
			<div className={`${stylesPage.pageContent} ${styles.container}`}>
				<Index />
			</div>
		</div>
	);
};

export default UserSettings;
