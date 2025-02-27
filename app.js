const TABLE_NAME = "notice"; // 테이블명
const PRIMARY_KEY = "post_id"; // 프라임 키

let mysql= require("mysql2");
let db_info= {
    host:"localhost",
    port:"3306",
    user:"root",
    password:"1234",
    database: "board"
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
    let sql= "SELECT * FROM " + TABLE_NAME + " ORDER BY post_id DESC;";
    conn.query(sql, (err, result) =>{
        if(err) console.log("query is not excuted: "+ err);
        else res.render("list", { data:result});
    });
});

app.get('/edit/:post_id', (req, res) => {
    const postId = req.params.post_id;
    let sql = "SELECT * FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY + " = " + postId + ";";
    conn.query(sql, (err, result) => {
        if(err) console.log("query is not excute at edit/:post_id : " + err);
        else res.render("edit", {item: result[0]});
    })
})

app.put('/editPost',  (req, res) => {
    const { postId, eHead, eBody} = req.body;
    let sql = "UPDATE " + TABLE_NAME + " SET head = ?, body = ? WHERE " + PRIMARY_KEY + " = " + postId + ";";
    conn.query(sql, [eHead, eBody, postId], (err, result) => {
        if (err) console.log("at editPost: " + err);
        else {
            let msg = `<script type="text/javascript"> `;
            msg += `alert("수정되었습니다.");`;
            msg += `location.href = "/list" ;`;
            msg += `</script>`;
            res.send(msg);
        }
    })
})

// 삭제 실행
app.delete('/delete', (req, res) => {
    const {postId} = req.body;

    let sql = "DELETE FROM " + TABLE_NAME + " WHERE " + PRIMARY_KEY + " = ?;";
    conn.query(sql, [postId], (err, result) => {
        if(err){
            console.log("at delete: " + err);
        }
        else {
            let msg = "<script type='text/javascript'>";
            msg += `alert("삭제되었습니다."); location.href="/list";`;
            msg += `</script>`;
            res.send(msg);
        }
    })
})


// 메뉴(데이터 입력)
app.get('/input', (req, res) => {
    res.render("input"); // input.ejs(데이터 입력 화면)
});

// 입력받은 데이터를 DB에 저장하기
app.post('/inputPost', (req, res) => {
    const { head, body } = req.body;
    let sql = "INSERT INTO " + TABLE_NAME + " (head, body) VALUES (?, ?);";
    conn.query(sql, [head, body], (err, result) => {
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

// 검색창 랜더링링
app.get('/sqlSearch', (req, res) => {
    res.render("sqlSearch"); // sqlSearch.ejs(SQL 구문 입력 화면)
});

// 검색 실행.
app.post('/sqlSearch', (req, res) => {
    const { search } = req.body;
    let sql = "SELECT * FROM " + TABLE_NAME + " WHERE head = ? ORDER BY post_id DESC;";
    conn.query(sql, [search], (err, result) => {
        if (err) {
            res.send('<H1> 없는 제목입니다다.</H1><BR>' + err);
        } else res.render("list", { data: result }); // list.ejs(DB 테이블 목록)
    });
});
