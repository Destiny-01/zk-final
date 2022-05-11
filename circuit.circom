pragma circom 2.0.0;
//include "./pedersenhash.circom";
include "./comparators.circom";

template Dead() {
    signal input guess[4];
    signal input solution[4];

    signal output out[4][4];
    signal output deadOut[4];
    component compare_dead[4];
    for (var k = 0; k < 4; k++) {
        compare_dead[k] = IsZero();
        compare_dead[k].in <== guess[k] - solution[k];
        if (1 == compare_dead[k].out) {
            deadOut[k] <-- k + 30;
        }
    }
    component compare_injured[4][4];
    var i = 0;
    var j = 0;
    for(i = 0; i < 4; i++) {
        for(j = 0; j < 4; j++) {
            if(i!=j){
                compare_injured[i][j] = IsZero();
                compare_injured[i][j].in <== guess[i] - solution[j];
                if (1 == compare_injured[i][j].out) {
                    out[i][j] <-- i+40;
                }
            }
        }
    }
}

    // signal input hashedSolution;    
    // signal input saltedSolution;

    // component pedersen = PedersenHashSingle();
    // pedersen.in <== saltedSolution;

    // hashedSolution === pedersen.encoded;

component main {public [guess]} = Dead();
