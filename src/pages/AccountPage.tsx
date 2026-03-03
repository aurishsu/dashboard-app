import { useParams, Navigate } from 'react-router-dom';
import { useData } from '../context/useData';
import { BankCardDetails } from './BankCardDetails';
import { WalletDetails } from './WalletDetails';
import { BrokerDetails } from './BrokerDetails';

export function AccountPage() {
    const { id } = useParams<{ id: string }>();
    const { accounts } = useData();
    const account = accounts.find(a => a.id === id);

    if (!account) return <Navigate to="/dashboard" replace />;
    if (account.type === 'bank') return <BankCardDetails cardId={id} key={id} />;
    if (account.type === 'wallet') return <WalletDetails walletId={id} key={id} />;
    if (account.type === 'broker') return <BrokerDetails brokerId={id} key={id} />;
    return <Navigate to="/dashboard" replace />;
}
