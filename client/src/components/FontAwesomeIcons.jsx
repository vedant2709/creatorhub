import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { 
  faEye, 
  faEyeSlash, 
  faCheckCircle, 
  faTimesCircle, 
  faSpinner,
  faChartLine,
  faUsers,
  faDollarSign,
  faVideo,
  faCog,
  faSignOutAlt,
  faBell,
  faSearch,
  faHome,
  faPlus,
  faStar,
  faChevronDown,
  faGlobe,
  faAt,
  faBook,
  faFolderPlus,
  faBox,
  faImage,
  faTrash
} from "@fortawesome/free-solid-svg-icons";

// Add icons to library
library.add(
  faEye, faEyeSlash, faCheckCircle, faTimesCircle, faSpinner,
  faChartLine, faUsers, faDollarSign, faVideo, faCog,
  faSignOutAlt, faBell, faSearch, faHome, faPlus,
  faStar, faChevronDown, faGlobe, faAt, faBook, faFolderPlus,
  faBox, faImage, faTrash
);

export const EyeIcon = (props) => <FontAwesomeIcon icon={faEye} {...props} />;
export const EyeSlashIcon = (props) => <FontAwesomeIcon icon={faEyeSlash} {...props} />;
export const CheckCircleIcon = (props) => <FontAwesomeIcon icon={faCheckCircle} {...props} />;
export const TimesCircleIcon = (props) => <FontAwesomeIcon icon={faTimesCircle} {...props} />;
export const SpinnerIcon = (props) => <FontAwesomeIcon icon={faSpinner} {...props} />;
export const ChartLineIcon = (props) => <FontAwesomeIcon icon={faChartLine} {...props} />;
export const UsersIcon = (props) => <FontAwesomeIcon icon={faUsers} {...props} />;
export const DollarSignIcon = (props) => <FontAwesomeIcon icon={faDollarSign} {...props} />;
export const VideoIcon = (props) => <FontAwesomeIcon icon={faVideo} {...props} />;
export const CogIcon = (props) => <FontAwesomeIcon icon={faCog} {...props} />;
export const SignOutAltIcon = (props) => <FontAwesomeIcon icon={faSignOutAlt} {...props} />;
export const BellIcon = (props) => <FontAwesomeIcon icon={faBell} {...props} />;
export const SearchIcon = (props) => <FontAwesomeIcon icon={faSearch} {...props} />;
export const HomeIcon = (props) => <FontAwesomeIcon icon={faHome} {...props} />;
export const PlusIcon = (props) => <FontAwesomeIcon icon={faPlus} {...props} />;
export const StarIcon = (props) => <FontAwesomeIcon icon={faStar} {...props} />;
export const ChevronDownIcon = (props) => <FontAwesomeIcon icon={faChevronDown} {...props} />;
export const GlobeIcon = (props) => <FontAwesomeIcon icon={faGlobe} {...props} />;
export const AtIcon = (props) => <FontAwesomeIcon icon={faAt} {...props} />;
export const BookIcon = (props) => <FontAwesomeIcon icon={faBook} {...props} />;
export const FolderPlusIcon = (props) => <FontAwesomeIcon icon={faFolderPlus} {...props} />;
export const BoxIcon = (props) => <FontAwesomeIcon icon={faBox} {...props} />;
export const ImageIcon = (props) => <FontAwesomeIcon icon={faImage} {...props} />;
export const TrashIcon = (props) => <FontAwesomeIcon icon={faTrash} {...props} />;

export default FontAwesomeIcon;