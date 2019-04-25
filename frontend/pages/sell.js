import Link from 'next/link';
import CreateItem from '../components/CreateItem';
import PleaseSignIn from '../components/PleaseSignIn';

const Sell = props => (
  <PleaseSignIn>
    <CreateItem />
    <Link href="/">
      <a>home</a>
    </Link>
  </PleaseSignIn>
);

export default Sell;
