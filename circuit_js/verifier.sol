//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.11;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() internal pure returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() internal pure returns (G2Point memory) {
        // Original code point
        return G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );

/*
        // Changed by Jordi point
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
*/
    }
    /// @return r the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) internal pure returns (G1Point memory r) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-add-failed");
    }
    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success,"pairing-mul-failed");
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length,"pairing-lengths-failed");
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[0];
            input[i * 6 + 3] = p2[i].X[1];
            input[i * 6 + 4] = p2[i].Y[0];
            input[i * 6 + 5] = p2[i].Y[1];
        }
        uint[1] memory out;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-opcode-failed");
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}
contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(
            17069909839473351290999318429910206711703580892024419215933201507052252953258,
            15029921877365643850469478079379053732699270542480068385505573721141100493530
        );

        vk.beta2 = Pairing.G2Point(
            [14091029689390615905281901849850724374732055461200820716564608454660957747946,
             7260400618254245783905689664781287844159117818104035046778193745932420726718],
            [5340490965935314363402827660163818395995630567808525886810790619397410496316,
             3931697212572336276651836394306587441038399633997217741780979852261685664414]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [15867138522052432455205369473632884372904124484317442762759447951893609214559,
             11907071483036650787259559125486243709575869187707173567226859488737906435484],
            [9829736476567221428776631239306822991347182093712790219420841821644511158408,
             15045857497426608012597590601602353336364743753812423930558743723802123626303]
        );
        vk.IC = new Pairing.G1Point[](25);
        
        vk.IC[0] = Pairing.G1Point( 
            1020151982366739663224105699632748748606539626163480985954732633144086907796,
            17543858534076298217636157309421960249691775148816014950647847571317430811645
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            20588655628489731506427837431179067244822458619381602720725011216214872115602,
            8707806878617653573342747618806948375285437983811882569958135306181820525762
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            2670137064182080558032842744229461063729122070549033111970939775913487414119,
            19986081507029497474900770635040875799774545582018930755746508243597220014532
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            9948081512604477319164110515272584235150476521191743660386203563703000483253,
            9500327282174912114612217594747428177796316783166746551271615823822466652144
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            17682490956033284995359721587959166142146798360325542190637274909404358065343,
            7546899077395683146631361694824575791279406792242178814994836132752260543427
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            13908335699185881449067828834513556057221291048912690160525581131548070425873,
            16140521766370273915600307888366407665764340794291953187306516262681254024784
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            7704607298869124884925020990276709318984667777879722404096044341547013859401,
            16209106028060810018835082458032639077051541318792670660567007121149640594860
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            10194423029036677088850299349655884280052621612713520919207275793672975691019,
            6617142957051746692324640769527755244404467625945477558988311861476450556656
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            16548295697896106419675857198783757131994102615802666331973306846559639032156,
            10923903226953687742035334209148284696704603380776992120916324307687120139571
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            21487778223101076149398910836354871151919363061073957979992145650493071298148,
            18336085632323414013421095070736605761523859504304522524431381366472710591496
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            12769466239678200013549954551875473127265657488818009382235310791441195814634,
            8450229669063285809619551647835701063333274053988913304280130130150906540866
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            16486717163171482971657654504279386366304424867228958214109905894132468399830,
            2278999223107001575435818713500598055141579035502786782495695076464064197257
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            19361582969100305412996193110605293278634142936472541252243786944920044679483,
            7001217637547199737603207972624505197347445134827701576183075452608100317428
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            5619126671833845837111625529713265400289622101149607457992526662334836909218,
            2288898772640845180873947901306518657636592616447987469718368388816903275905
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            5592980828514404328180400146827176171260910562548613758116259140453587801902,
            5356781049304298324614959253678185023438532738975049702420715453758924324070
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            4350596592797504807878518121817129073521463199958767597448179832369077867117,
            3157243710057502679170480924870594076954834085890574410785714731230038942752
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            13170132157436497143901050957373137164943575762373735975737853155720732180857,
            1463401271030756477371658856022285094574632684595234925903973293698184573525
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            18501491232325282177778976730069699497705076772625673252293168325889073679673,
            2498676103238256318094965508593169275788316018849718967088895693320405717831
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            13291332503819419206338766273545929775039448945600893640177728018204374416712,
            6000520048749712091878609527315809709630071358680185057489353505332922614401
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            6173333124545502559041979942165551388461990681042395026966606077876552913824,
            4670994217881542466281772094825432913823061635990509109376546126914905139522
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            1270950923378996890751610657501586995869993585492774963634905443109591157671,
            14148761273107310701128990197564028626105921364301314987749148688230483237300
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            3075763370093802432319813741879818467542198555951570818018205126269176255378,
            17892390601746302883537615655201693313698396925829345865125660431347517109866
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            20382684312436837914524323751176288822152849881546160631049746729704056737009,
            3780483887441510266388692598794115061973191199827759992031014529451007712075
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            10145487157500890270477136832868392767021936848022880693427425338654166339027,
            7594622583642256117143365427572134352075556096193867466890051965738308684803
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            4417792201937771506630390319380008433443724584074442918362684000050547971297,
            6128798591584434510253541775387831203605853878984186929260405360524636613239
        );                                      
        
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.IC.length,"verifier-bad-input");
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.IC[0]);
        if (!Pairing.pairingProd4(
            Pairing.negate(proof.A), proof.B,
            vk.alfa1, vk.beta2,
            vk_x, vk.gamma2,
            proof.C, vk.delta2
        )) return 1;
        return 0;
    }
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[24] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
