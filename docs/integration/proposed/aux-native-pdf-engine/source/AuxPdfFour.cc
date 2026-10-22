// Reconstructed original synchronous PDF4 surface. Inactive, no original addon use.
#include <node_api.h>
#include "fpdfview.h"
#include "fpdf_text.h"
#include "fpdf_formfill.h"
#include "fpdf_ppo.h"
#include "fpdf_edit.h"
#include "fpdf_annot.h"
#include "RecoveredPngCodec.h"
#include <algorithm>
#include <map>
#include <variant>
#include "fpdf_save.h"
#include "RecoveredPdfPageSelection.h"
#include <cmath>
#include <codecvt>
#include <cstdio>
#include <filesystem>
#include <fstream>
#include <locale>
#include <mutex>
#include <stdexcept>
#include <string>
#include <vector>
namespace aux::pdf { std::vector<int> ReadPageNumbers(napi_env,napi_value,int); }
namespace {
std::mutex pdf_mutex;
std::string PathUtf8(const std::filesystem::path&path){auto bytes=path.u8string();return {reinterpret_cast<const char*>(bytes.data()),bytes.size()};}
napi_value Object(napi_env env){napi_value v{};napi_create_object(env,&v);return v;}
napi_value Array(napi_env env,size_t size){napi_value v{};napi_create_array_with_length(env,size,&v);return v;}
void Set(napi_env env,napi_value object,const char*key,napi_value value){napi_set_named_property(env,object,key,value);}
void SetInt(napi_env env,napi_value object,const char*key,int number){napi_value v{};napi_create_int32(env,number,&v);Set(env,object,key,v);}
void SetString(napi_env env,napi_value object,const char*key,const std::string&text){napi_value v{};napi_create_string_utf8(env,text.data(),text.size(),&v);Set(env,object,key,v);}
napi_value Get(napi_env env,napi_value object,const char*key){napi_value v{};napi_get_named_property(env,object,key,&v);return v;}
bool Has(napi_env env,napi_value object,const char*key){bool has=false;napi_has_named_property(env,object,key,&has);return has;}
std::string String(napi_env env,napi_value value){size_t length=0;napi_get_value_string_utf8(env,value,nullptr,0,&length);std::vector<char> bytes(length+1);napi_get_value_string_utf8(env,value,bytes.data(),bytes.size(),&length);return {bytes.data(),length};}
std::string RequiredString(napi_env env,napi_value object,const char*key){
  if(!Has(env,object,key))throw std::runtime_error(std::string("Missing ")+key);
  auto value=Get(env,object,key);napi_valuetype type=napi_undefined;napi_typeof(env,value,&type);
  if(type!=napi_string)throw std::runtime_error(std::string(key)+" must be a string");
  return String(env,value);
}
double RequiredNumber(napi_env env,napi_value object,const char*key){
  if(!Has(env,object,key))throw std::runtime_error(std::string("Missing ")+key);
  auto value=Get(env,object,key);napi_valuetype type=napi_undefined;napi_typeof(env,value,&type);double number=0;
  if(type!=napi_number||napi_get_value_double(env,value,&number)!=napi_ok||!std::isfinite(number))throw std::runtime_error(std::string(key)+" must be a finite number");
  return number;
}
struct Library {
  Library(){FPDF_LIBRARY_CONFIG config{};config.version=2;FPDF_InitLibraryWithConfig(&config);}
  ~Library(){FPDF_DestroyLibrary();}
};
struct Document {
  std::vector<char> bytes;FPDF_DOCUMENT document=nullptr;FPDF_FORMFILLINFO callbacks{};FPDF_FORMHANDLE form=nullptr;
  explicit Document(const std::string&path){
    std::ifstream input(std::filesystem::u8path(path),std::ios::binary|std::ios::ate);
    if(!input)throw std::runtime_error("Failed to open PDF file");
    auto count=input.tellg();if(count<=0)throw std::runtime_error("PDF file is empty");
    bytes.resize(static_cast<size_t>(count));input.seekg(0);input.read(bytes.data(),count);
    if(!input)throw std::runtime_error("Failed to read PDF file");
    document=FPDF_LoadMemDocument64(bytes.data(),bytes.size(),nullptr);
    if(!document)throw std::runtime_error("Failed to open PDF (PDFium error "+std::to_string(FPDF_GetLastError())+")");
    callbacks.version=1;form=FPDFDOC_InitFormFillEnvironment(document,&callbacks);
    if(!form){FPDF_CloseDocument(document);document=nullptr;throw std::runtime_error("Failed to initialize AcroForm support");}
  }
  ~Document(){if(form)FPDFDOC_ExitFormFillEnvironment(form);if(document)FPDF_CloseDocument(document);}
  Document(const Document&)=delete;Document&operator=(const Document&)=delete;
};
struct NewDocument {
  FPDF_DOCUMENT document=FPDF_CreateNewDocument();
  NewDocument(){if(!document)throw std::runtime_error("Failed to create PDF");}
  ~NewDocument(){FPDF_CloseDocument(document);}
  NewDocument(const NewDocument&)=delete;NewDocument&operator=(const NewDocument&)=delete;
};
struct Page {
  Document&doc;FPDF_PAGE page;
  Page(Document&d,int index):doc(d),page(FPDF_LoadPage(d.document,index)){if(page)FORM_OnAfterLoadPage(page,doc.form);}
  ~Page(){if(page){FORM_OnBeforeClosePage(page,doc.form);FPDF_ClosePage(page);}}
  Page(const Page&)=delete;Page&operator=(const Page&)=delete;
};
struct TextPage {
  FPDF_TEXTPAGE page;
  explicit TextPage(FPDF_PAGE p):page(FPDFText_LoadPage(p)){}
  ~TextPage(){if(page)FPDFText_ClosePage(page);}
};
struct Writer:FPDF_FILEWRITE {
  std::ofstream output;
  explicit Writer(const std::filesystem::path&path):output(path,std::ios::binary|std::ios::trunc){version=1;WriteBlock=&Write;}
  static int Write(FPDF_FILEWRITE*writer,const void*data,unsigned long size){auto*self=static_cast<Writer*>(writer);self->output.write(static_cast<const char*>(data),size);return self->output.good()?1:0;}
};
void Save(FPDF_DOCUMENT document,const std::string&output){
  auto path=std::filesystem::u8path(output);if(path.has_parent_path())std::filesystem::create_directories(path.parent_path());
  Writer writer(path);if(!writer.output.is_open()||!FPDF_SaveAsCopy(document,&writer,FPDF_NO_INCREMENTAL))throw std::runtime_error("Failed to write PDF");
}
std::string Utf8(const unsigned short*bytes,size_t count){
  const auto*start=reinterpret_cast<const char16_t*>(bytes);
  return std::wstring_convert<std::codecvt_utf8_utf16<char16_t>,char16_t>{}.to_bytes(start,start+count);
}
napi_value ExtractText(napi_env env,napi_value input){
  Document doc(RequiredString(env,input,"filePath"));int count=FPDF_GetPageCount(doc.document);
  auto selected=aux::pdf::ReadPageNumbers(env,input,count);auto pages=Array(env,selected.size());
  for(size_t i=0;i<selected.size();++i){int number=selected[i];Page page(doc,number-1);
    if(!page.page)throw std::runtime_error("Failed to read PDF page "+std::to_string(number));
    TextPage text(page.page);if(!text.page)throw std::runtime_error("Failed to read PDF text on page "+std::to_string(number));
    int size=FPDFText_CountChars(text.page);if(size<0)throw std::runtime_error("Failed to read PDF text on page "+std::to_string(number));
    std::vector<unsigned short> buffer(static_cast<size_t>(size)+1);
    int written=FPDFText_GetText(text.page,0,size,buffer.data());
    std::string value=written>0?Utf8(buffer.data(),written-1):std::string{};
    auto item=Object(env);SetInt(env,item,"page",number);SetString(env,item,"text",value);napi_set_element(env,pages,i,item);
  }
  auto result=Object(env);SetInt(env,result,"pageCount",count);Set(env,result,"pages",pages);return result;
}
napi_value Merge(napi_env env,napi_value input){
  if(!Has(env,input,"files"))throw std::runtime_error("Missing files");auto files=Get(env,input,"files");bool array=false;napi_is_array(env,files,&array);
  if(!array)throw std::runtime_error("files must be an array");uint32_t length=0;napi_get_array_length(env,files,&length);if(length==0)throw std::runtime_error("files must not be empty");
  auto output=RequiredString(env,input,"outputPath");NewDocument merged;
  for(uint32_t i=0;i<length;++i){napi_value file{};napi_get_element(env,files,i,&file);auto path=RequiredString(env,file,"filePath");Document doc(path);
    auto pages=aux::pdf::ReadPageNumbers(env,file,FPDF_GetPageCount(doc.document));std::vector<int> indexes;for(int page:pages)indexes.push_back(page-1);
    if(!FPDF_ImportPagesByIndex(merged.document,doc.document,indexes.data(),indexes.size(),FPDF_GetPageCount(merged.document)))throw std::runtime_error("Failed to merge PDF "+path);
  }
  Save(merged.document,output);auto result=Object(env);SetString(env,result,"outputPath",output);SetInt(env,result,"pageCount",FPDF_GetPageCount(merged.document));return result;
}
napi_value Rotate(napi_env env,napi_value input){
  auto file=RequiredString(env,input,"filePath"),output=RequiredString(env,input,"outputPath");double degrees=RequiredNumber(env,input,"degrees");
  if(degrees!=-270&&degrees!=-180&&degrees!=-90&&degrees!=90&&degrees!=180&&degrees!=270)throw std::runtime_error("degrees must be -270, -180, -90, 90, 180, or 270");
  Document doc(file);int count=FPDF_GetPageCount(doc.document);auto selected=aux::pdf::ReadPageNumbers(env,input,count);auto pages=Array(env,selected.size());
  for(size_t i=0;i<selected.size();++i){int number=selected[i];Page page(doc,number-1);if(!page.page)throw std::runtime_error("Failed to load PDF page "+std::to_string(number));int rotation=FPDFPage_GetRotation(page.page);
    if(rotation<0)throw std::runtime_error("Failed to read PDF page rotation");int quarter=static_cast<int>(degrees/90);FPDFPage_SetRotation(page.page,((rotation+quarter)%4+4)%4);napi_value value{};napi_create_int32(env,number,&value);napi_set_element(env,pages,i,value);
  }
  Save(doc.document,output);auto result=Object(env);SetString(env,result,"outputPath",output);SetInt(env,result,"pageCount",count);Set(env,result,"pages",pages);return result;
}
napi_value Split(napi_env env,napi_value input){
  auto file=RequiredString(env,input,"filePath"),directory=RequiredString(env,input,"outputDir");Document doc(file);int count=FPDF_GetPageCount(doc.document);auto selected=aux::pdf::ReadPageNumbers(env,input,count);std::filesystem::create_directories(std::filesystem::u8path(directory));auto pages=Array(env,selected.size());
  for(size_t i=0;i<selected.size();++i){int number=selected[i],index=number-1;NewDocument output;
    if(!FPDF_ImportPagesByIndex(output.document,doc.document,&index,1,0))throw std::runtime_error("Failed to split PDF page "+std::to_string(number));
    char name[64];std::snprintf(name,sizeof(name),"page_%03d.pdf",number);auto path=PathUtf8(std::filesystem::u8path(directory)/name);Save(output.document,path);
    auto item=Object(env);SetInt(env,item,"page",number);SetString(env,item,"path",path);napi_set_element(env,pages,i,item);
  }
  auto result=Object(env);SetInt(env,result,"pageCount",count);Set(env,result,"pages",pages);return result;
}

void SetBool(napi_env env,napi_value object,const char*key,bool value){napi_value v{};napi_get_boolean(env,value,&v);Set(env,object,key,v);}
void SetDouble(napi_env env,napi_value object,const char*key,double value){napi_value v{};napi_create_double(env,value,&v);Set(env,object,key,v);}
template<class Reader>std::string ReadWide(Reader reader){
  unsigned long bytes=reader(nullptr,0);if(bytes<=2)return {};
  std::vector<unsigned short> buffer(bytes/2);unsigned long read=reader(buffer.data(),bytes);
  return read>2?Utf8(buffer.data(),read/2-1):std::string{};
}
struct Annotation{FPDF_ANNOTATION annotation;explicit Annotation(FPDF_PAGE page,int index):annotation(FPDFPage_GetAnnot(page,index)){}~Annotation(){if(annotation)FPDFPage_CloseAnnot(annotation);}};
struct Field{int page;std::string name,alternate,type,raw,value,export_value;int flags;FS_RECTF rect{};std::vector<std::string>options;};
const char* FieldType(int type){switch(type){case 1:return "button";case 2:return "checkbox";case 3:return "radio";case 4:case 5:return "choice";case 6:return "text";case 7:return "signature";default:return "unknown";}}
const char* RawType(int type){switch(type){case 1:case 2:case 3:return "Btn";case 4:case 5:return "Ch";case 6:return "Tx";case 7:return "Sig";default:return "";}}
std::vector<Field> InspectFields(Document&doc){
  std::vector<Field> fields;
  for(int index=0;index<FPDF_GetPageCount(doc.document);++index){Page page(doc,index);if(!page.page)continue;
    for(int ai=0;ai<FPDFPage_GetAnnotCount(page.page);++ai){Annotation a(page.page,ai);if(!a.annotation||FPDFAnnot_GetSubtype(a.annotation)!=FPDF_ANNOT_WIDGET)continue;
      int type=FPDFAnnot_GetFormFieldType(doc.form,a.annotation);Field f;f.page=index+1;
      f.name=ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetFormFieldName(doc.form,a.annotation,b,n);});if(f.name.empty())continue;
      f.alternate=ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetFormFieldAlternateName(doc.form,a.annotation,b,n);});
      f.type=FieldType(type);f.raw=RawType(type);
      f.value=ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetFormFieldValue(doc.form,a.annotation,b,n);});
      f.export_value=ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetFormFieldExportValue(doc.form,a.annotation,b,n);});
      f.flags=FPDFAnnot_GetFormFieldFlags(doc.form,a.annotation);FPDFAnnot_GetRect(a.annotation,&f.rect);
      for(int option=0;option<FPDFAnnot_GetOptionCount(doc.form,a.annotation);++option)f.options.push_back(ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetOptionLabel(doc.form,a.annotation,option,b,n);}));
      fields.push_back(std::move(f));
    }
  }
  std::sort(fields.begin(),fields.end(),[](const Field&a,const Field&b){if(a.page!=b.page)return a.page<b.page;if(a.rect.bottom!=b.rect.bottom)return a.rect.bottom>b.rect.bottom;return a.rect.left<b.rect.left;});return fields;
}
napi_value FieldObject(napi_env env,const Field&f){
  auto item=Object(env);SetInt(env,item,"page",f.page);SetString(env,item,"field_id",f.name);SetString(env,item,"name",f.name);SetString(env,item,"type",f.type);SetString(env,item,"raw_type",f.raw);SetString(env,item,"value",f.value);SetInt(env,item,"flags",f.flags);
  if(!f.alternate.empty()){SetString(env,item,"alternate_name",f.alternate);SetString(env,item,"description",f.alternate);}if(!f.export_value.empty())SetString(env,item,"export_value",f.export_value);
  if(!f.options.empty()){auto options=Array(env,f.options.size());for(size_t i=0;i<f.options.size();++i){napi_value v{};napi_create_string_utf8(env,f.options[i].data(),f.options[i].size(),&v);napi_set_element(env,options,i,v);}Set(env,item,"options",options);}
  auto bounds=Object(env);SetDouble(env,bounds,"x",f.rect.left);SetDouble(env,bounds,"y",f.rect.bottom);SetDouble(env,bounds,"width",f.rect.right-f.rect.left);SetDouble(env,bounds,"height",f.rect.top-f.rect.bottom);Set(env,item,"bounds",bounds);return item;
}
napi_value GetFormFields(napi_env env,napi_value input){
  Document doc(RequiredString(env,input,"filePath"));auto fields=InspectFields(doc);auto array=Array(env,fields.size());for(size_t i=0;i<fields.size();++i)napi_set_element(env,array,i,FieldObject(env,fields[i]));
  auto result=Object(env);SetInt(env,result,"pageCount",FPDF_GetPageCount(doc.document));SetBool(env,result,"hasFormFields",!fields.empty());SetInt(env,result,"fieldCount",fields.size());int type=FPDF_GetFormType(doc.document);
  SetString(env,result,"formType",type==1?"acroform":type==2?"xfa_full":type==3?"xfa_foreground":"none");SetBool(env,result,"supportsXfa",false);Set(env,result,"fields",array);return result;
}
struct Bitmap{FPDF_BITMAP bitmap;Bitmap(int width,int height):bitmap(FPDFBitmap_Create(width,height,0)){}~Bitmap(){if(bitmap)FPDFBitmap_Destroy(bitmap);}};
napi_value RenderPages(napi_env env,napi_value input){
  auto file=RequiredString(env,input,"filePath"),directory=RequiredString(env,input,"outputDir");double max_dimension=Has(env,input,"maxDimension")?RequiredNumber(env,input,"maxDimension"):1600;
  if(max_dimension<256||max_dimension>4096)throw std::runtime_error("maxDimension must be between 256 and 4096");
  Document doc(file);int count=FPDF_GetPageCount(doc.document);auto selected=aux::pdf::ReadPageNumbers(env,input,count);std::filesystem::create_directories(std::filesystem::u8path(directory));auto pages=Array(env,selected.size());
  for(size_t i=0;i<selected.size();++i){int number=selected[i];Page page(doc,number-1);if(!page.page)throw std::runtime_error("Failed to load PDF page "+std::to_string(number));
    double width=FPDF_GetPageWidthF(page.page),height=FPDF_GetPageHeightF(page.page);if(width<=0||height<=0)throw std::runtime_error("PDF page has invalid dimensions");
    double scale=max_dimension/std::max(width,height);int w=std::max(1,static_cast<int>(std::round(width*scale))),h=std::max(1,static_cast<int>(std::round(height*scale)));Bitmap bitmap(w,h);
    if(!bitmap.bitmap||!FPDFBitmap_FillRect(bitmap.bitmap,0,0,w,h,0xffffffff))throw std::runtime_error("Failed to create PDF page bitmap");
    constexpr int flags=0x13;FPDF_RenderPageBitmap(bitmap.bitmap,page.page,0,0,w,h,0,flags);FPDF_FFLDraw(doc.form,bitmap.bitmap,page.page,0,0,w,h,0,flags);
    auto png=aux::pdf::EncodeRenderedPng(static_cast<const unsigned char*>(FPDFBitmap_GetBuffer(bitmap.bitmap)),w,h,FPDFBitmap_GetStride(bitmap.bitmap));
    char name[64];std::snprintf(name,sizeof(name),"page_%03d.png",number);auto path=std::filesystem::u8path(directory)/name;std::ofstream output(path,std::ios::binary|std::ios::trunc);output.write(reinterpret_cast<const char*>(png.data()),png.size());if(!output.good())throw std::runtime_error("Failed to write rendered PDF page");
    auto item=Object(env);SetInt(env,item,"page",number);SetString(env,item,"path",PathUtf8(path));SetInt(env,item,"width",w);SetInt(env,item,"height",h);napi_set_element(env,pages,i,item);
  }
  auto result=Object(env);SetInt(env,result,"pageCount",count);Set(env,result,"pages",pages);return result;
}

using FieldValue=std::variant<std::nullptr_t,bool,double,std::string>;
FieldValue ReadFieldValue(napi_env env,napi_value value){napi_valuetype type=napi_undefined;napi_typeof(env,value,&type);
  if(type==napi_null||type==napi_undefined)return nullptr;
  if(type==napi_boolean){bool b=false;napi_get_value_bool(env,value,&b);return b;}if(type==napi_number){double n=0;napi_get_value_double(env,value,&n);return n;}if(type==napi_string)return String(env,value);
  throw std::runtime_error("Field value must be a string, number, boolean, or null");
}
std::string TextValue(napi_env env,const FieldValue&value){if(std::holds_alternative<std::nullptr_t>(value))return "";if(auto p=std::get_if<std::string>(&value))return *p;if(auto p=std::get_if<bool>(&value))return *p?"true":"false";
  napi_value number{},string{};napi_create_double(env,std::get<double>(value),&number);napi_coerce_to_string(env,number,&string);return String(env,string);
}
std::string FormValue(FPDF_FORMHANDLE form,FPDF_ANNOTATION annotation){return ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetFormFieldValue(form,annotation,b,n);});}
std::string ExportValue(FPDF_FORMHANDLE form,FPDF_ANNOTATION annotation){return ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetFormFieldExportValue(form,annotation,b,n);});}
std::string AnnotationString(FPDF_ANNOTATION annotation,const char*key){return ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetStringValue(annotation,key,b,n);});}
bool SetTextField(napi_env env,Document&doc,FPDF_PAGE page,FPDF_ANNOTATION annotation,const FieldValue&value){
  auto text=TextValue(env,value);auto wide=std::wstring_convert<std::codecvt_utf8_utf16<char16_t>,char16_t>{}.from_bytes(text);
  if(!FORM_SetFocusedAnnot(doc.form,annotation)||!FORM_SelectAllText(doc.form,page))return false;
  FORM_ReplaceSelection(doc.form,page,reinterpret_cast<FPDF_WIDESTRING>(wide.c_str()));FORM_ForceToKillFocus(doc.form);return FormValue(doc.form,annotation)==text;
}
bool SetChoiceField(napi_env env,Document&doc,FPDF_PAGE page,FPDF_ANNOTATION annotation,const FieldValue&value){
  auto text=TextValue(env,value);int desired=-1,current=-1;
  for(int i=0;i<FPDFAnnot_GetOptionCount(doc.form,annotation);++i){auto label=ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetOptionLabel(doc.form,annotation,i,b,n);});if(label==text)desired=i;if(FPDFAnnot_IsOptionSelected(doc.form,annotation,i))current=i;}
  if(desired<0||!FORM_SetFocusedAnnot(doc.form,annotation))return false;
  if(current<0){current=0;FORM_OnKeyDown(doc.form,page,0x24,0);}int key=current<desired?0x28:0x26;
  for(int i=0;i<std::abs(desired-current);++i)FORM_OnKeyDown(doc.form,page,key,0);
  FORM_ForceToKillFocus(doc.form);return FormValue(doc.form,annotation)==text;
}
bool ActivateWidget(Document&doc,FPDF_PAGE page,FPDF_ANNOTATION annotation){
  if(FORM_SetFocusedAnnot(doc.form,annotation)&&FORM_OnChar(doc.form,page,0x20,0)){FORM_ForceToKillFocus(doc.form);return true;}
  FS_RECTF rect{};if(!FPDFAnnot_GetRect(annotation,&rect))return false;
  double x=(rect.left+rect.right)/2,y=(rect.bottom+rect.top)/2;return FORM_OnLButtonDown(doc.form,page,0,x,y)&&FORM_OnLButtonUp(doc.form,page,0,x,y);
}
bool DesiredCheckbox(const FieldValue&value,const std::string&exported,bool&desired){
  if(std::holds_alternative<std::nullptr_t>(value)){desired=false;return true;}if(auto p=std::get_if<bool>(&value)){desired=*p;return true;}if(auto p=std::get_if<double>(&value)){desired=*p!=0;return true;}
  const auto&text=std::get<std::string>(value);if(text==exported||text=="true"){desired=true;return true;}if(text.empty()||text=="false"||text=="Off"){desired=false;return true;}return false;
}
struct FillState{FieldValue value;bool found=false;bool filled=false;std::string error;};
std::map<std::string,FillState> ReadFillStates(napi_env env,napi_value input){
  if(!Has(env,input,"fields"))throw std::runtime_error("Missing fields");auto fields=Get(env,input,"fields");bool array=false;napi_is_array(env,fields,&array);if(!array)throw std::runtime_error("fields must be an array");uint32_t length=0;napi_get_array_length(env,fields,&length);std::map<std::string,FillState> states;
  for(uint32_t i=0;i<length;++i){napi_value field{};napi_get_element(env,fields,i,&field);auto name=RequiredString(env,field,Has(env,field,"field_id")?"field_id":"name");if(!Has(env,field,"value"))throw std::runtime_error("Missing value for field "+name);states.insert_or_assign(name,FillState{ReadFieldValue(env,Get(env,field,"value")),false,false,{}});}
  if(states.empty())throw std::runtime_error("No field values provided");return states;
}
void FillWidget(napi_env env,Document&doc,FPDF_PAGE page,FPDF_ANNOTATION annotation,int type,FillState&state){
  state.found=true;if(state.filled)return;
  if(type==6){state.filled=SetTextField(env,doc,page,annotation,state.value);if(!state.filled)state.error="Failed to update text field";return;}
  if(type==4||type==5){state.filled=SetChoiceField(env,doc,page,annotation,state.value);if(!state.filled)state.error="Value does not match a choice option";return;}
  if(type==2){bool desired=false;if(!DesiredCheckbox(state.value,ExportValue(doc.form,annotation),desired)){state.error="Value does not match the checkbox export value";return;}
    auto as=AnnotationString(annotation,"AS");bool current=!as.empty()&&as!="Off";if(current!=desired)ActivateWidget(doc,page,annotation);as=AnnotationString(annotation,"AS");state.filled=(!as.empty()&&as!="Off")==desired;if(!state.filled)state.error="Failed to update checkbox";return;
  }
  if(type==3){auto desired=std::get_if<std::string>(&state.value);if(!desired){state.error="Radio fields require an export value string";return;}if(*desired!=ExportValue(doc.form,annotation))return;
    if(AnnotationString(annotation,"AS")!=*desired)ActivateWidget(doc,page,annotation);state.filled=FormValue(doc.form,annotation)==*desired;if(!state.filled)state.error="Failed to update radio field";return;
  }
  state.error="Field type is not fillable";
}
napi_value FillFormFields(napi_env env,napi_value input){
  auto file=RequiredString(env,input,"filePath"),output=RequiredString(env,input,"outputPath");auto states=ReadFillStates(env,input);Document doc(file);int form_type=FPDF_GetFormType(doc.document);if(form_type==2||form_type==3)throw std::runtime_error("XFA forms are not supported");
  for(int index=0;index<FPDF_GetPageCount(doc.document);++index){Page page(doc,index);if(!page.page)continue;
    for(int ai=0;ai<FPDFPage_GetAnnotCount(page.page);++ai){Annotation a(page.page,ai);if(!a.annotation||FPDFAnnot_GetSubtype(a.annotation)!=FPDF_ANNOT_WIDGET)continue;auto name=ReadWide([&](unsigned short*b,unsigned long n){return FPDFAnnot_GetFormFieldName(doc.form,a.annotation,b,n);});auto found=states.find(name);if(found!=states.end())FillWidget(env,doc,page.page,a.annotation,FPDFAnnot_GetFormFieldType(doc.form,a.annotation),found->second);}
  }
  auto filled=Array(env,0),missing=Array(env,0),invalid=Array(env,0);uint32_t nf=0,nm=0,ni=0;
  for(const auto&entry:states){const auto&name=entry.first;const auto&state=entry.second;napi_value value{};napi_create_string_utf8(env,name.data(),name.size(),&value);
    if(state.filled)napi_set_element(env,filled,nf++,value);else if(!state.found)napi_set_element(env,missing,nm++,value);else{auto item=Object(env);SetString(env,item,"field_id",name);SetString(env,item,"message",state.error.empty()?"No matching field option":state.error);napi_set_element(env,invalid,ni++,item);}}
  Save(doc.document,output);auto result=Object(env);SetBool(env,result,"success",nm==0&&ni==0);SetString(env,result,"outputPath",output);SetInt(env,result,"filledCount",nf);Set(env,result,"filledFields",filled);Set(env,result,"missingFields",missing);Set(env,result,"invalidFields",invalid);return result;
}
template<napi_value(*Operation)(napi_env,napi_value)>napi_value Run(napi_env env,napi_callback_info info){
  size_t argc=1;napi_value input{};napi_get_cb_info(env,info,&argc,&input,nullptr,nullptr);
  if(argc<1){napi_throw_type_error(env,nullptr,"PDF operation requires an input object");return nullptr;}
  std::lock_guard<std::mutex> guard(pdf_mutex);
  try{Library library;return Operation(env,input);}catch(const std::exception&error){napi_throw_error(env,nullptr,error.what());return nullptr;}
}
}
NAPI_MODULE_INIT(){
  auto pdf=Object(env);
  struct Export{const char*name;napi_callback callback;};
  const Export methods[]={{"extractText",Run<ExtractText>},{"merge",Run<Merge>},{"rotate",Run<Rotate>},{"split",Run<Split>},{"getFormFields",Run<GetFormFields>},{"renderPages",Run<RenderPages>},{"fillFormFields",Run<FillFormFields>}};
  for(const auto&method:methods){napi_value function{};napi_create_function(env,method.name,NAPI_AUTO_LENGTH,method.callback,nullptr,&function);Set(env,pdf,method.name,function);}
  Set(env,exports,"pdf",pdf);return exports;
}
