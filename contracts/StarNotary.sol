// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";


// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

   constructor()  ERC721("STAR", "STR"){}

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    function createStar(string memory _name, uint256 _tokenId) public { 
        Star memory newStar = Star(_name);
        //add validation to ensure the star name is not empty
        require(bytes(_name).length > 0, "The name of this star cant be empty!!");
        tokenIdToStarInfo[_tokenId] = newStar; 
        _mint(msg.sender, _tokenId); 
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        transferFrom(ownerAddress, msg.sender, _tokenId);
        address payable ownerAddressPayable = _make_payable(ownerAddress);
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
       return tokenIdToStarInfo[_tokenId].name;
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address ownerAddress1 = ownerOf(_tokenId1);
        address ownerAddress2 = ownerOf(_tokenId2);
      if (msg.sender == ownerAddress1 || msg.sender == ownerAddress2) {
	       	transferFrom(ownerAddress1, ownerAddress2, _tokenId1);
	       	transferFrom(ownerAddress2, ownerAddress1, _tokenId2);
		}

    }

    function transferStar(address _to1, uint256 _tokenId) public {
         address ownerAddress = ownerOf(_tokenId);
         if(msg.sender == ownerAddress){
             transferFrom(ownerAddress, _to1, _tokenId);
         }
    }

}
