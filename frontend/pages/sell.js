import Link from 'next/link';
import CreateItem from '../components/CreateItem';

const Sell = props => (
  <div>
    <CreateItem />
    <Link to="/">home</Link>
  </div>
);

export default Sell;
