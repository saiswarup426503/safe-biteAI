import { Search } from "lucide-react";

function SearchBar() {

    return (

        <div className="search">

            <Search size={20} />

            <input

                type="text"

                placeholder="Search restaurants, cuisines, dishes..."

            />

        </div>

    );

}

export default SearchBar;