import Foundation
@main enum AccountIdentityFixture {
    static func main()throws {
        let profile="34f92a9e-e7d5-47c8-9323-33a2b82c4c8a"
        let incarnation="14f22d6d-b6ab-4f76-a79d-601cf909573f"
        func registry()->[String:Any] {[
            "version":1,"currentAccountId":0,
            "accounts":[["id":0,"mode":"local","provider":"anonymous","authStatus":"active","createdAt":1,"incarnationId":incarnation]],
            "profileAccountBindings":[profile:["profileId":profile,"accountId":0,"profilePath":"/synthetic/Aux/Default","updatedAt":1]]
        ]}
        func decode(_ value:[String:Any],account:Int64=0)throws->AuxMemoryAccountIdentity {
            try AuxMemoryAccountIdentity.decode(JSONSerialization.data(withJSONObject:value),account:account)
        }
        func refuses(_ body:()throws->Void)throws {
            do{try body();fatalError("Malformed or ambiguous account was accepted")}catch{}
        }
        let original=try decode(registry())
        var duplicate=registry();duplicate["accounts"]=(duplicate["accounts"] as! [[String:Any]])+(duplicate["accounts"] as! [[String:Any]])
        try refuses{_ = try decode(duplicate)}
        var ambiguous=registry(),bindings=ambiguous["profileAccountBindings"] as! [String:Any]
        let second="2082544f-2195-4a34-ab28-8ac5af872cad"
        bindings[second]=["profileId":second,"accountId":0,"profilePath":"/synthetic/Aux/Other","updatedAt":1];ambiguous["profileAccountBindings"]=bindings
        try refuses{_ = try decode(ambiguous)}
        var reused=registry(),accounts=reused["accounts"] as! [[String:Any]]
        accounts[0]["incarnationId"]="6b8b6516-6070-4a5a-a960-d7574c23b880";reused["accounts"]=accounts
        let reusedIdentity=try decode(reused);precondition(reusedIdentity != original)
        var rebound=registry();bindings=rebound["profileAccountBindings"] as! [String:Any]
        var binding=bindings[profile] as! [String:Any];binding["updatedAt"]=2;bindings[profile]=binding;rebound["profileAccountBindings"]=bindings
        let reboundIdentity=try decode(rebound);precondition(reboundIdentity != original)
        var switched=registry();switched["currentAccountId"]=20
        let switchedIdentity=try decode(switched);precondition(switchedIdentity==original)
        try refuses{_ = try decode(registry(),account:1)}
        var missing=registry();bindings=missing["profileAccountBindings"] as! [String:Any];binding=bindings[profile] as! [String:Any];binding.removeValue(forKey:"profilePath");bindings[profile]=binding;missing["profileAccountBindings"]=bindings
        try refuses{_ = try decode(missing)}
        let raw=Data("{\"version\":1,\"version\":1,\"accounts\":[],\"profileAccountBindings\":{}}".utf8)
        try refuses{_ = try AuxMemoryAccountIdentity.decode(raw,account:0)}
        print("PASS actual account parser: valid local identity, duplicate account/binding and missing owner refusal, changed incarnation/binding fencing, independent current selection, duplicate JSON-key refusal")
    }
}
