import React, { useState } from 'react';

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import CardPaper from 'src/components/CardPaper';

import Invoices from './Invoices';
import Settings from './Settings';

import styles from './MemberDetails.module.css';

const MemberDetails = props => {
	const { member, invoicesData, updateMember, getInvoices } = props;
	const [tabName, setTabName] = useState(/artist/.test(member.roles) ? 'invoices' : 'settings');

	const onChangeTab = (event, tabName) => setTabName(tabName);

	return (
		<CardPaper
			leftContent={
				<Tabs className={styles.tabs} value={tabName} onChange={onChangeTab}>
					{/artist/.test(member.roles) ? <Tab value="invoices" label="Счета" id="invoices" /> : null}
					<Tab value="settings" label="Настройки" id="settings" />
				</Tabs>
			}
			style={{ marginTop: 16 }}
		>
			{tabName === 'invoices' ? (
				<Invoices member={member} invoicesData={invoicesData} updateMember={updateMember} getInvoices={getInvoices} />
			) : tabName === 'settings' ? (
				<Settings member={member} updateMember={updateMember} />
			) : null}
		</CardPaper>
	);
};

export default MemberDetails;
