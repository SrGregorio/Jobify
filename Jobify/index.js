const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3')
const dbConnection = sqlite.open({
    filename: './banco.sqlite',
    driver: sqlite3.Database
}, {Promise})
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true}))
app.get('/', async(request, response) => {
    const db = await dbConnection
    const categoriasDB = await db.all('select * from categorias;')
    const vagas = await db.all ('select * from vagas;')
    const categorias = categoriasDB.map(cat =>{
        return {
            ...cat, 
            vagas: vagas.filter( vaga => vaga.categoria === cat.id)
        }
        
    })
    response.render('home', {
        categorias
    })
})

//criar tela de vaga
app.get('/vaga/:id', async(request, response) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = '+request.params.id)
    response.render('vaga', {
        vaga
    })
})
//Criar tela de admin
app.get('/admin', (req, res) => {
    res.render('admin/home')
})
//criar tela de admin vagas
app.get('/admin/vagas', async(req,res)=> {
    const db = await dbConnection    
    const vagas = await db.all ('select * from vagas;')
    res.render('admin/vagas', { vagas })
})
// Apagar vaga cadastrada
app.get('/admin/vaga/delete/:id', async(req,res)=> {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id+'')
    res.redirect('/admin/vagas')
})
// Criar tela de nova vaga
app.get('/admin/vagas/nova/', async(req,res)=> {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', { categorias })
})
// Copiando os dados incluídos do formulário para o BD
app.post('/admin/vagas/nova', async(req,res) => {
    const db = await dbConnection
    const { titulo, descricao, categoria } = req.body
    await db.run(`insert into vagas(categoria, titulo, descricao) values(${categoria}, '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')
})
// Tela para editar as vagas existentes
app.get('/admin/vaga/editar/:id', async(req,res)=> {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id ='+req.params.id)
    const categorias = await db.all('select * from categorias')
    res.render('admin/editar-vaga', { categorias, vaga })
})
//Retornar os dados já inclusos na tela de cadastro para alteração
app.post('/admin/vaga/editar/:id', async(req,res)=> {
    const db = await dbConnection
    const { id } = req.params
    const { titulo, descricao, categoria } = req.body
    await db.run(`update vagas set categoria = '${categoria}', titulo = '${titulo}', descricao = '${descricao})' where id = ${id}`)
    res.redirect('/admin/vagas')
})
// Criar tela de Admin Categorias
app.get('/admin/categorias', async(req,res)=> {
    const db = await dbConnection    
    const categorias = await db.all ('select * from categorias;')
    res.render('admin/categorias', { categorias })
})
// Criar tela de Novas Categorias
app.get('/admin/categorias/nova', async(req,res)=> {
    const db = await dbConnection    
    const categorias = await db.all ('select * from categorias;')
    res.render('admin/nova-categoria', { categorias })
})
// Copiando os dados incluídos do formulário para o BD
app.post('/admin/categorias/nova', async(req,res) => {
    const db = await dbConnection
    const { categoria } = req.body
    await db.run(`insert into categorias(categoria) values('${categoria}')`)
    res.redirect('/admin/categorias')
})
// Apagar categoria cadastrada
app.get('/admin/categorias/delete/:id', async(req,res)=> {  
    const db = await dbConnection
    await db.run('delete from categorias where id ='+req.params.id)
    res.redirect('/admin/categorias/')
})
// Tela para editar as categorias existentes
app.get('/admin/categorias/editar/:id', async(req,res)=> {
    const db = await dbConnection
    const categorias = await db.get('select * from categorias where id ='+req.params.id)
    const categoria = await db.all('select * from categorias')
    res.render('admin/editar-categoria', { categorias, categoria })
})
//Retornar os dados já inclusos na tela de cadastro para alteração
app.post('/admin/categorias/editar/:id', async(req,res)=> {
    const db = await dbConnection
    const { id } = req.params
    const { categoria } = req.body
    await db.run(`update categorias set categoria = '${categoria}' where id = ${id}`)
    res.redirect('/admin/categorias')
})
//Criar tela para login admin
app.get('/login', async(req, res)=> {
    const db = await dbConnection
    res.render('login/login-admin')
})

app.post('/login', async(req, res)=> {
    const db = await dbConnection
    const { login, senha } = req.body
    const usuarios = await db.get(`select * from usuarios where user = ${login} AND password = ${senha}`)
        if (usuarios.length == 1){
            res.redirect('/admin')
        }else{
            res.redirect('/login')
   }
     
})


const init = async() => {
    const db = await dbConnection
    //await db.run('create table if not exists categorias (id INTEGER NOT NULL PRIMARY KEY, categoria TEXT);')
    //await db.run('create table if not exists vagas (id INTEGER NOT NULL PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    // const categoria = 'Marketing Team'
    // await db.run(`insert into categorias(categoria) values('${categoria}')`)
    // const vaga = 'Social Media'
    // const descricao = 'Vaga para Social Media' 
    // await db.run(`insert into vagas(categoria, titulo, descricao) values(2, '${vaga}', '${descricao}')`)
    //await db.run('create table if not exists usuarios(id INTEGER NOT NULL PRIMARY KEY, user TEXT, password TEXT);')
    //await db.run(`insert into usuarios(user, password) values('user${user}', '${password}')`)
}       

init()

app.listen(3000, (err) =>{
    if(err){
    console.log('Não foi possivel iniciar o servidor do Jobify')
    }else{
    console.log('Servidor do Jobify rodando...')
    }
}) 