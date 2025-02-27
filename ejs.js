let mysql= require("mysql2");
 let db_info= {
    host:"localhost",
    port:"3306",
    user:"root",
    password:"1234",
    database:"board" 
}

let conn= mysql.createConnection(db_info);
conn.connect();

const express= require('express');
const app= express();
const port= 8080;
const bodyParser= require("body-parser");
app.use(bodyParser.urlencoded({ extended:true}));

// 뷰엔진 설정
app.set("view engine", "ejs"); 
app.set("views", "./views");  


app.use(express.static(__dirname+ '/public'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.listen(port, () =>{
    console.log(`${port}번 포트에서 대기중...`);
});
app.get('/', (req, res) =>{
    res.render("ejsMain");
});
   
app.get('/centerFrame', (req, res) =>{
    res.render("centerFrame"); // centerFrame(가운데 메인 화면)
})

// 메뉴(모든 보기)
app.get('/list', (req, res) =>{
    let sql= "SELECT * FROM stock ORDER BY no DESC;"; // 최근 글을 위쪽으로
    conn.query(sql, (err, result) =>{
        if(err) console.log("query is not excuted: "+ err);
        else res.render("list", { data:result});
    });
});

app.get('/edit/:noKey', (req, res) => {
    const noKey = req.params.noKey;
    let sql = "SELECT * FROM stock WHERE no =" + noKey + ";";
    conn.query(sql, (err, result) => {
        if(err) console.log("query is not excute at deit/:noKey : " + err);
        else res.render("edit", {data: result[0]});
    })
})

app.put('/editPost',  (req, res) => {
    const {noEdit, CompanyEdit, priceEdit, codeEdit } = req.body;
    let sql = "UPDATE stock SET Company = '" + CompanyEdit + "', ";
    sql += "price=" + priceEdit + ", code=" + codeEdit;
    sql += " WHERE no=" + noEdit;

    conn.query(sql, (err, result) => {
        if (err) console.log("err at editPost: " + err);
        else {
            let msg = `<script type="text/javascript"> `;
            msg += `alert("수정되었습니다.");`;
            msg += `location.href = "/list" ;`;
            msg += `</script>`;
            res.send(msg);
        }
    })
})

app.delete('/delete', (req, res) => {
    const {noKey} = req.body;
    let sql = "DELETE FROM stock WHERE no=" + noKey + ";";
    conn.query(sql, (err, result) => {
        if(err){
            console.log("err at delete: " + err);
        }
        else {
            let msg = "<script type='text/javascript'>";
            msg += `alert("삭제되었습니다."); location.href="/list";`;
            msg += `</script>`;
            res.send(msg);
        }
    })
})





// ***************************************************************
// 메뉴(데이터 입력)
app.get('/input', (req, res) => {
    res.render("input"); // input.ejs(데이터 입력 화면)
});

// input.ejs 화면에 입력된 데이터 결과를DB에 저장하기
app.post('/inputPost', (req, res) => {
    const { CompanyInput, priceInput, codeInput } = req.body;
    let sql = "INSERT INTO stock (Company, price, code) VALUES (?, ?, ?)";
    conn.query(sql, [CompanyInput, priceInput, codeInput], (err, result) => {
        if (err) console.log("query is not executed: " + err);
        else {
            let msg = `<script type="text/javascript">`;
            msg += `alert("저장되었습니다");`;
            msg += `window.location.href='/list';`;
            msg += `</script>`;
            res.send(msg);
        }
    });
});

// *************************************************************************
// 메뉴(데이터 검색)
app.get('/sqlSearch', (req, res) => {
    res.render("sqlSearch"); // sqlSearch.ejs(SQL 구문 입력 화면)
});

// TEXT에 입력된 검색 조건을 실행 한 결과를 화면에 표시
app.post('/sqlSearch', (req, res) => {
    const { inputSearch } = req.body;
    let sql = inputSearch;
    conn.query(sql, (err, result) => {
        if (err) {
            res.send('<H1>SQL 조건문을 정확히 입력하세요.</H1><BR>' + err);
        } else res.render("list", { data: result }); // list.ejs(DB 테이블 목록)
    });
});
