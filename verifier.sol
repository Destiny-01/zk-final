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
            [17921749976806251432011683458870979561550270299715254184011122754683545026056,
             4697984537040460583656412433391437653649350854082156841232781080691685522875],
            [19203695167789031440958965184958385596848503406843815386392762854178045284623,
             772960663089087843789867532823433639415807557190709257837190824664797076232]
        );
        vk.IC = new Pairing.G1Point[](37);
        
        vk.IC[0] = Pairing.G1Point( 
            2901780080997911927722625356464304875800762005273574665894898827678460843675,
            11183773719035084628332674577591607394217623521561189542872449216688126684143
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            17314659881503357449504848994151015704852998048487157944754431612999977673627,
            2278455783301373486534242179196131693290420335633591703103642126290336225874
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            11240443864978699864283700866538609191932984312561741095720391535467072228063,
            4650025907380084309324638288619993795074178573108175212174793874260987044948
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            9464138091167575553033612708029768089903008349297051385513748958646530042430,
            12017876530142830268799461755261041701507647811107194636452408071132499822184
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            20506122569165577455971983103131821207316358857192001687078681131815298799546,
            12745239833263103258305220470065322147817990185074651680723799465318397556474
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            4300939337569665455581271811545109062656055080005703171069519459915494795873,
            7546481820810360280540647333721146818491368753518752323090568169341998756124
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            19182393597558006170348760944686169573139482567232922491267214667285996534300,
            18091982102184412356304099845962363455804399383807601819696119777002094970232
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            20466490646610441461250841146868992616183755245330576536478086978770352718180,
            12003948424014135646082128096995497128810088712073063012099240640371939553376
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            14549473304287413108992543232907127746569298678390652356605987014734213963851,
            7537974295583405170747076577113587508632393877941039530405497942904310980667
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            6679365543496708891228697911915936754113914386140063660103661081155062394648,
            15484858106421482122360347354401824157397433829103823968883748055675058396907
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            18062204297461772640025503157690066837160140975792196763382986286671422522227,
            11810218570609381682497608546684380246978297321993979288352206552941548512456
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            1946811365054883157799275424224246474795372226380863208941561355571719109090,
            3186090366698854020007728916344123802045881107860582827231989352218409395666
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            15800536756658896657080033871269427854888971080803266325638656344563429103461,
            14496339113344446004925780612223802316312323240066401061750717442275552950235
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            568712442546946217317569694659410605374642750143819449002918215841527864892,
            11482256915577477148109448274643055652175493480520413197159655515662523926013
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            11686919197554953372573556740715803491128413960425634826763993790815611299583,
            9590840803907430539361961925449178244942747708155453196144894484631613470062
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            54847099448768944612570245687472073940788164980759725255329438443118248588,
            2594356666884974809862589928925782734094138690039063645926719208039658765602
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            11410644536552678927263713558525381607322985395799105290189090249221692278720,
            18905371126683868019241257940653080163774503107189692373705911649441900829077
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            6551348643168939658284587834377052948033614937517339394115041716651914036271,
            17566164062354677969880373327265374830759052892940550019730144237364132792524
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            8761575149597152820902609197904339167365630167000502888101984657136517439471,
            13032723605902402961237832268627567695463154736568698294809934527847724942439
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            10759696805797530624285351193686956782900675454444239071041975455506175070669,
            5735151347222069704064772785467163146126565604773640791106462369348355466853
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            17335311226480540556697210231289554617237299574992480594295754476783186625944,
            5633198724753807595950728863180740715685667975878020809695793909657167549144
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            1529117293289897288210769817472160958829191517496870034253735299092860055373,
            18623545817637463287064560497944715627680621250867707413914695650031260222808
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            7863860064325237641706765465189641279335281474221270912049659911342942937065,
            12025047826275142597766040457284107621522847305945942044008309723172918578839
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            2840959325322940949355853647856277748372781290025249339556921345050667682451,
            20090001030176796992981499775634586524773638142464087417602409205984677786471
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            1234539154585966652982495037443965652941495971051342360695599480508841927484,
            197284690782006474663233526228374395555998704534672341209428150554941379081
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            20056725803321347646093837993910191731949341437284085162412595308492423012835,
            58316956381472363444039650219846164975078910704621924169354501382313996902
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            19828594714099748433531146152535454587015046905642929488760562481906420381386,
            11143742173327547212467860475120933883065015665796487471268548159033799708108
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            20301281245069294224289688186914124561137095298154624628157792253401578920707,
            17335329248111678100669605181957473072604475629840643255252128065761198714408
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            7899522675453941430116515533665310010035224632728085750261933588589574678164,
            11183028592447530199347926646486498117120669853826935447002794256656349107830
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            17151631845627716713804642460380970840200783059381066169903678586379917066164,
            9545063774619672170749278546208990752124305203095295125615417750366639443796
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            462155210074493685294719128375218235842295342179776740561486221779973694480,
            6614295483679622722741657138193109026278940369198068353750260349882064943318
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            14212897803610670527811716899550770924532839263652958734025793483120140065868,
            8339731653703438635461382567032605417653349176112472451393858898823243798381
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            20531380733130550867188856532578594499383719395915834254594669183809786367099,
            1043177257902889039839152247765853525734604298644465446494889401460399389427
        );                                      
        
        vk.IC[33] = Pairing.G1Point( 
            14516607554398345125429880079480487771267112053089942712710803682093358349944,
            4253726954319578568466254205791603647269239973111994536092896079127596842306
        );                                      
        
        vk.IC[34] = Pairing.G1Point( 
            19583776534248930606507580457429521560241179252342155584500042796105885686492,
            6583317001402649830385929544357198678340936978580885014678777093473153271500
        );                                      
        
        vk.IC[35] = Pairing.G1Point( 
            5430451569048882131885606719524692409368370434079014111426468119780964955450,
            17844660004109715113443163745510744680437729511418789965074667380449734135248
        );                                      
        
        vk.IC[36] = Pairing.G1Point( 
            5703739693145523501159846776348088325331030012522428609554946912374213494923,
            1488455485274676483658424193457827589388457096391505201634678353884175626975
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
            uint[36] memory input
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
