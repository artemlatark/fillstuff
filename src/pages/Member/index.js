import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import loadable from '@loadable/component';

import generateMetaInfo from 'shared/generate-meta-info';

import { history } from 'src/helpers/history';

import Head from 'src/components/head';
import HeaderPage from 'src/components/HeaderPage';
import { LoadingPage } from 'src/components/Loading';
import { withCurrentUser } from 'src/components/withCurrentUser';

import { getMember } from 'src/actions/members';
import { getInvoicesMember } from 'src/actions/invoices';

import stylesPage from 'src/styles/page.module.css';
import styles from './index.module.css';

const Index = loadable(() => import('./containers/index' /* webpackChunkName: "Member_Index" */), {
	fallback: <LoadingPage />,
});

const Members = props => {
	const { currentStudio } = props;
	const [memberData, setMemberData] = useState(null);
	const [invoicesData, setInvoicesData] = useState(null);

	const metaInfo = {
		pageName: 'member',
		pageTitle: 'Данные пользователя',
	};

	if (memberData && memberData.data && memberData.data.user.name) {
		metaInfo.pageTitle = memberData.data.user.name;
	}

	const { title, description } = generateMetaInfo({
		type: metaInfo.pageName,
		data: {
			title: metaInfo.pageTitle,
		},
	});

	const pageParams = {
		backToPage: memberData && memberData.data && memberData.data.guest ? '/members/guests' : '/members',
	};

	const getMember = () => {
		props.getMember().then(response => {
			if (response.status === 'success') {
				setMemberData(response);
			} else {
				history.push({
					pathname: '/members',
				});
			}
		});
	};

	const updateMember = memberData => {
		setMemberData(memberData);
	};

	const getInvoices = () => {
		props.getInvoicesMember().then(response => {
			setInvoicesData(response);
		});
	};

	useEffect(() => {
		getMember();
		getInvoices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={stylesPage.page}>
			<Head title={title} description={description} />

			<HeaderPage pageName={metaInfo.pageName} pageTitle="Команда" pageParams={pageParams} />
			<div className={`${stylesPage.pageContent} ${styles.container}`}>
				<Index
					currentStudio={currentStudio}
					memberData={memberData}
					invoicesData={invoicesData}
					updateMember={updateMember}
					getInvoices={getInvoices}
				/>
			</div>
		</div>
	);
};

const mapDispatchToProps = (dispatch, ownProps) => {
	const {
		match: {
			params: { memberId },
		},
	} = ownProps;

	return {
		getMember: () => dispatch(getMember({ params: { memberId } })),
		getInvoicesMember: () => dispatch(getInvoicesMember({ params: { memberId } })),
	};
};

export default compose(connect(null, mapDispatchToProps), withCurrentUser)(Members);
