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
pragma solidity ^0.8.4;
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
            [14928252846309254103588594617948823649392688435658373103744032572636939542267,
             5897989293640957591672839043381043123701617782151703021609396330752172968369],
            [19966068406007268974664240840422373367796545872247346628988785350380283494188,
             10927696102751201348956461750821614949529282108932474349088946273862612386025]
        );
        vk.IC = new Pairing.G1Point[](26);
        
        vk.IC[0] = Pairing.G1Point( 
            1295475580794193938216188197208569170536660511016830132325147812142316096519,
            11054238090591456258150757876895265480358434184543221896998193332021099565485
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            393682376776285481952928240759419146941014953885608799420096805705065995101,
            17877431968150655575398520193993785475327997125127581417156309280736759054265
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            4264239658857443780851547864662628485375224542789201549479224386399040858365,
            4903412338552398840602264905231436628211060375235360763065051031754217395919
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            18360378027725788759235320843579677888648761416218843343958107192994033062515,
            14974964908692471031169380804879031091413262160649311950376668609294564728942
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            7650648720536615212744678167720735132959633602252317141566483564986510306782,
            10456673394749798165734663927320032408657682586141687777417444519678757916462
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            14191112003529030448052108095759355037723107877587829394339829633040608311243,
            2554258107092681475578387921387399335114036268451163773271469700624845706051
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            11257592342755673824239938899452356588422131627817358086576090889685877366488,
            19547475388863423595059919559089300622406401785298121591323072477105360072766
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            6804139459661405622583637720106472297175630197297558209535570109052091156115,
            11809601449175013352088763424408870914985177011839231756883436059631123914596
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            17962927502447742964989077478495005707936793404485753754256521185815567231365,
            893220732876649137084724438544664316856904589794494412962312338697458369084
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            14484143360776035142597770627067952647135231884031302300433442427519361925584,
            4497993946409253727638883871362145440925889246653785173503163521366208408219
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            19753808353806368496670513313803289368860384468884006079145382711741364605585,
            18201417421334844181497278683555678896263510842920682052805453032914606099949
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            4349122331505788662804185701923784249578318668881113105505707605408240285127,
            9102522042272172269453096076784682607951523037341931521166987818703202756803
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            14380937584640829588535950268582512286949397735644443746660147422731481993093,
            17386419521758151479921979263632692318659657708131670980780330810389217261769
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            38246147591693148849777713807214492290046461116556868688512909698307955700,
            6869836772166260518737972142125270511921510418138377696763858874037230296711
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            13174383374025877614237009315254767649828610241556059570419415012093171710827,
            4722520325405160752711926283485153177601540796051174825132400211177802092915
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            19433380269454959146398808253330128393059918450079642681243117224441672254909,
            6390753850297004911323539819751086056971790427369457388339051267089763932225
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            180550161084423233659314655430002098634094404443969567090717485649719659831,
            18051460315112735724885025581871432956262821438931761289373306668441638834290
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            3002400801258658836759051921936270485842189825946034916602803946600223871948,
            11561117090039609898155797848785856944535581696739762372878891550530263582188
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            9493090112969356441659678342316892790269996271123490300179210652576506616922,
            10828987370492888218873995972743927388892823587154581341850726236540514548116
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            3374719151176882307180321043722977943691290316263534656814324989666330665491,
            10009548930849892405319605411948161078807529542800445729724514104517183765601
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            7151336310735718401276075342192302281105981061924385128488202674980593127830,
            8966459553787063384788547754385339147456277188491611898282734029711355475271
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            11634066485529524350929178706096912498708571972817776869297798740269616107964,
            6428396176527522100952935310513790730238967881592450752605779581064255794313
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            5047904238386740989957976913169323785362664575482939182286635312879576678370,
            569253633282499226729225677652097669010145307014077915389728531234885236239
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            19423662334727558062655190007222062791233821706143148869914383743644753707553,
            14900643824368847868093633013468026630777030627289794432809470796894987223847
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            165878219825979297692898818339576238215413189966741525468485300233495537414,
            20320797433557353283133998211726430096806787614531491774069311103626875668180
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            2053241849968698844343691145109390029928316678752679320446707456089909602831,
            10900950926539677095902255059455444502148276449870027689076370107274058694060
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
            uint[25] memory input
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
